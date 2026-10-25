package io.github.denystrypolskyi.backend.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Optional;

@Service
public class RefreshCookieService {
    private static final String NAME = "timely_refresh_token";
    private final boolean secure;
    private final String sameSite;

    public RefreshCookieService(@Value("${app.auth-cookie.secure:false}") boolean secure,
                                @Value("${app.auth-cookie.same-site:Strict}") String sameSite) {
        this.secure = secure;
        this.sameSite = sameSite;
    }

    public ResponseCookie create(String token, Instant expiresAt) {
        return base(token).maxAge(Duration.between(Instant.now(), expiresAt)).build();
    }

    public ResponseCookie clear() {
        return base("").maxAge(Duration.ZERO).build();
    }

    public Optional<String> read(HttpServletRequest request) {
        if (request.getCookies() == null) return Optional.empty();
        return Arrays.stream(request.getCookies()).filter(cookie -> NAME.equals(cookie.getName()))
                .map(Cookie::getValue).filter(value -> !value.isBlank()).findFirst();
    }

    private ResponseCookie.ResponseCookieBuilder base(String value) {
        return ResponseCookie.from(NAME, value).httpOnly(true).secure(secure)
                .sameSite(sameSite).path("/api/users");
    }
}
