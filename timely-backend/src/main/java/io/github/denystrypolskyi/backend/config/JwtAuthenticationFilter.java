package io.github.denystrypolskyi.backend.config;

import io.github.denystrypolskyi.backend.model.CustomUserDetails;
import io.github.denystrypolskyi.backend.service.CustomUserDetailsService;
import io.github.denystrypolskyi.backend.service.JwtCookieService;
import io.github.denystrypolskyi.backend.service.JWTService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JWTService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final JwtCookieService jwtCookieService;

    public JwtAuthenticationFilter(JWTService jwtService,
                                   CustomUserDetailsService userDetailsService,
                                   JwtCookieService jwtCookieService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.jwtCookieService = jwtCookieService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        if (path.equals("/api/users/login")
                || path.equals("/api/users/logout")
                || path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = getToken(request);

        if (token != null) {
            try {
                Long userId = jwtService.parseUserId(token);
                CustomUserDetails user = userDetailsService.loadUserById(userId);

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                user, null, user.getAuthorities()
                        );

                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (JwtException | IllegalArgumentException | UsernameNotFoundException exception) {
                response.addHeader(HttpHeaders.SET_COOKIE, jwtCookieService.clear().toString());
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getToken(HttpServletRequest request) {
        return jwtCookieService.read(request).orElse(null);
    }
}

