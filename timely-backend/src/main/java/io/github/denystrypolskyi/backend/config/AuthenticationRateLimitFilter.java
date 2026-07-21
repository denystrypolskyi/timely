package io.github.denystrypolskyi.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

public class AuthenticationRateLimitFilter extends OncePerRequestFilter {
    private static final Limit LOGIN_LIMIT = new Limit("login", 10, Duration.ofMinutes(1));
    private static final Limit REGISTRATION_LIMIT = new Limit("registration", 5, Duration.ofHours(1));
    private static final Limit OAUTH_LIMIT = new Limit("oauth", 20, Duration.ofMinutes(1));

    private final Map<String, RequestWindow> windows = new ConcurrentHashMap<>();
    private final AtomicLong requestCount = new AtomicLong();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        Limit limit = limitFor(request);
        if (limit == null) {
            filterChain.doFilter(request, response);
            return;
        }

        Instant now = Instant.now();
        String key = limit.name() + ':' + request.getRemoteAddr();
        RequestWindow window = windows.computeIfAbsent(key, ignored -> new RequestWindow(now.plus(limit.period())));
        long retryAfterSeconds = window.tryAcquire(now, limit);

        if (requestCount.incrementAndGet() % 256 == 0) {
            windows.entrySet().removeIf(entry -> entry.getValue().isExpired(now));
        }

        if (retryAfterSeconds > 0) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.setHeader("Retry-After", Long.toString(retryAfterSeconds));
            response.getWriter().write("{\"error\":\"TOO_MANY_REQUESTS\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private static Limit limitFor(HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();

        if (HttpMethod.POST.matches(method) && path.equals("/api/users/login")) {
            return LOGIN_LIMIT;
        }
        if (HttpMethod.POST.matches(method) && path.equals("/api/users/register")) {
            return REGISTRATION_LIMIT;
        }
        if (HttpMethod.POST.matches(method) && path.equals("/api/users/oauth/exchange")) {
            return LOGIN_LIMIT;
        }
        if (HttpMethod.GET.matches(method) && path.startsWith("/oauth2/authorization/")) {
            return OAUTH_LIMIT;
        }
        return null;
    }

    private record Limit(String name, int requests, Duration period) {
    }

    private static final class RequestWindow {
        private Instant resetsAt;
        private int requests;

        private RequestWindow(Instant resetsAt) {
            this.resetsAt = resetsAt;
        }

        private synchronized long tryAcquire(Instant now, Limit limit) {
            if (!now.isBefore(resetsAt)) {
                resetsAt = now.plus(limit.period());
                requests = 0;
            }
            if (requests >= limit.requests()) {
                return Math.max(1, Duration.between(now, resetsAt).toSeconds());
            }
            requests++;
            return 0;
        }

        private synchronized boolean isExpired(Instant now) {
            return !now.isBefore(resetsAt);
        }
    }
}
