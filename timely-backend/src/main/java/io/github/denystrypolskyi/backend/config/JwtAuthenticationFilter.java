package io.github.denystrypolskyi.backend.config;

import io.github.denystrypolskyi.backend.model.CustomUserDetails;
import io.github.denystrypolskyi.backend.service.CustomUserDetailsService;
import io.github.denystrypolskyi.backend.service.JwtCookieService;
import io.github.denystrypolskyi.backend.service.JWTService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
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
                || path.equals("/api/users/refresh")
                || path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = getToken(request);

        if (token != null) {
            try {
                JWTService.TokenClaims claims = jwtService.parseToken(token);
                CustomUserDetails user = userDetailsService.loadUserById(claims.userId());

                if (user.getTokenVersion() != claims.tokenVersion()) {
                    throw new BadCredentialsException("Invalid JWT");
                }

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                user, null, user.getAuthorities()
                        );

                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (io.jsonwebtoken.ExpiredJwtException e) {
                if (clearInvalidBrowserSession(request, response, path)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"TOKEN_EXPIRED\"}");
                return;

            } catch (Exception e) {
                if (clearInvalidBrowserSession(request, response, path)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"INVALID_TOKEN\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }

        return jwtCookieService.read(request).orElse(null);
    }

    private boolean clearInvalidBrowserSession(HttpServletRequest request,
                                               HttpServletResponse response,
                                               String path) {
        boolean hasBearerToken = request.getHeader("Authorization") != null;
        if (!path.equals("/api/users/profile") || hasBearerToken) {
            return false;
        }

        response.addHeader(HttpHeaders.SET_COOKIE, jwtCookieService.clear().toString());
        return true;
    }
}

