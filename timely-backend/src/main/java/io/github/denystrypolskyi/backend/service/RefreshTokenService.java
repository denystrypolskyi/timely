package io.github.denystrypolskyi.backend.service;

import io.github.denystrypolskyi.backend.model.CustomUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

@Service
public class RefreshTokenService {
    private static final String TOKEN_TYPE_CLAIM = "tokenType";
    private static final String REFRESH_TOKEN_TYPE = "refresh";
    private static final String TOKEN_VERSION_CLAIM = "tokenVersion";

    private final SecretKey secretKey;
    private final long expirationMs;
    private final String issuer;
    private final String audience;
    private final JWTService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public RefreshTokenService(
            @Value("${app.jwt.secret}") String jwtSecret,
            @Value("${app.refresh-token.expiration-ms:2592000000}") long expirationMs,
            @Value("${app.jwt.issuer:timely-backend}") String issuer,
            @Value("${app.refresh-token.audience:timely-refresh}") String audience,
            JWTService jwtService,
            CustomUserDetailsService userDetailsService) {
        if (jwtSecret == null || jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("app.jwt.secret / JWT_SECRET must be at least 32 bytes");
        }
        if (expirationMs <= 0) {
            throw new IllegalArgumentException("Refresh token expiration must be positive");
        }
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.issuer = issuer;
        this.audience = audience;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    public String generateToken(CustomUserDetails user) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .issuer(issuer)
                .audience().add(audience).and()
                .subject(user.getId().toString())
                .claim(TOKEN_TYPE_CLAIM, REFRESH_TOKEN_TYPE)
                .claim(TOKEN_VERSION_CLAIM, user.getTokenVersion())
                .issuedAt(new Date(now))
                .expiration(new Date(now + expirationMs))
                .signWith(secretKey)
                .compact();
    }

    public Optional<RefreshedTokens> renew(String refreshToken) {
        try {
            TokenClaims claims = parseToken(refreshToken);
            CustomUserDetails user = userDetailsService.loadUserById(claims.userId());
            if (user.getTokenVersion() != claims.tokenVersion()) {
                return Optional.empty();
            }
            return Optional.of(new RefreshedTokens(
                    jwtService.generateToken(user),
                    generateToken(user)));
        } catch (JwtException | IllegalArgumentException | UsernameNotFoundException exception) {
            return Optional.empty();
        }
    }

    TokenClaims parseToken(String token) {
        Claims claims = Jwts.parser()
                .requireIssuer(issuer)
                .requireAudience(audience)
                .require(TOKEN_TYPE_CLAIM, REFRESH_TOKEN_TYPE)
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Long userId;
        try {
            userId = Long.valueOf(claims.getSubject());
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Invalid refresh token subject", exception);
        }

        Object rawTokenVersion = claims.get(TOKEN_VERSION_CLAIM);
        if (!(rawTokenVersion instanceof Number tokenVersion)) {
            throw new IllegalArgumentException("Refresh token version is missing");
        }
        return new TokenClaims(userId, tokenVersion.longValue());
    }

    public record RefreshedTokens(String accessToken, String refreshToken) {
    }

    record TokenClaims(Long userId, long tokenVersion) {
    }
}
