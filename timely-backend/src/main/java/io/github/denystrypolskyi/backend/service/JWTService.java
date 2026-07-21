package io.github.denystrypolskyi.backend.service;

import io.github.denystrypolskyi.backend.model.CustomUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JWTService {
    private static final String TOKEN_VERSION_CLAIM = "tokenVersion";

    private final SecretKey secretKey;
    private final long expirationMs;
    private final String issuer;
    private final String audience;

    public JWTService(
            @Value("${app.jwt.secret}") String jwtSecret,
            @Value("${app.jwt.expiration-ms:3600000}") long expirationMs,
            @Value("${app.jwt.issuer:timely-backend}") String issuer,
            @Value("${app.jwt.audience:timely-api}") String audience) {
        if (jwtSecret == null || jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("app.jwt.secret / JWT_SECRET must be at least 32 bytes");
        }
        if (expirationMs <= 0) {
            throw new IllegalArgumentException("JWT expiration must be positive");
        }

        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.issuer = issuer;
        this.audience = audience;
    }

    public String generateToken(CustomUserDetails user) {
        long now = System.currentTimeMillis();

        return Jwts.builder()
                .issuer(issuer)
                .audience().add(audience).and()
                .subject(user.getId().toString())
                .claim(TOKEN_VERSION_CLAIM, user.getTokenVersion())
                .issuedAt(new Date(now))
                .expiration(new Date(now + expirationMs))
                .signWith(secretKey)
                .compact();
    }

    public TokenClaims parseToken(String token) {
        Claims claims = Jwts.parser()
                .requireIssuer(issuer)
                .requireAudience(audience)
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Long userId;
        try {
            userId = Long.valueOf(claims.getSubject());
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Invalid JWT subject", exception);
        }

        Object rawTokenVersion = claims.get(TOKEN_VERSION_CLAIM);
        if (!(rawTokenVersion instanceof Number tokenVersion)) {
            throw new IllegalArgumentException("JWT token version is missing");
        }

        return new TokenClaims(userId, tokenVersion.longValue());
    }

    public record TokenClaims(Long userId, long tokenVersion) {
    }
}
