package io.github.denystrypolskyi.backend.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

@Service
public class JwtCookieService {
    private static final String COOKIE_NAME = "timely_access_token";
    private static final String COOKIE_PATH = "/api";

    private final boolean secure;
    private final String sameSite;
    private final Duration maxAge;

    public JwtCookieService(
            @Value("${app.auth-cookie.secure:false}") boolean secure,
            @Value("${app.auth-cookie.same-site:Strict}") String sameSite,
            @Value("${app.jwt.expiration-ms:3600000}") long expirationMs) {
        this.secure = secure;
        this.sameSite = sameSite;
        this.maxAge = Duration.ofMillis(expirationMs);
    }

    public ResponseCookie create(String token) {
        return baseCookie(token)
                .maxAge(maxAge)
                .build();
    }

    public ResponseCookie clear() {
        return baseCookie("")
                .maxAge(Duration.ZERO)
                .build();
    }

    public Optional<String> read(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }

        return Arrays.stream(request.getCookies())
                .filter(cookie -> COOKIE_NAME.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> !value.isBlank())
                .findFirst();
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(String value) {
        return ResponseCookie.from(COOKIE_NAME, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path(COOKIE_PATH);
    }
}
