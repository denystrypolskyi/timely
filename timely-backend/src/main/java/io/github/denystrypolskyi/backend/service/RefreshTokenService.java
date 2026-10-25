package io.github.denystrypolskyi.backend.service;

import io.github.denystrypolskyi.backend.model.RefreshSession;
import io.github.denystrypolskyi.backend.model.UserEntity;
import io.github.denystrypolskyi.backend.repository.RefreshSessionRepository;
import io.github.denystrypolskyi.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {
    private final RefreshSessionRepository sessions;
    private final UserRepository users;
    private final SecureRandom random = new SecureRandom();
    private final Duration lifetime;

    public RefreshTokenService(RefreshSessionRepository sessions, UserRepository users,
                               @Value("${app.refresh.expiration-days:30}") long expirationDays) {
        if (expirationDays <= 0) throw new IllegalArgumentException("Refresh expiration must be positive");
        this.sessions = sessions;
        this.users = users;
        this.lifetime = Duration.ofDays(expirationDays);
    }

    @Transactional
    public IssuedToken create(Long userId) {
        sessions.deleteExpired(Instant.now());
        UUID id = UUID.randomUUID();
        String secret = newSecret();
        UserEntity user = users.getReferenceById(userId);
        Instant expiresAt = Instant.now().plus(lifetime);
        sessions.save(new RefreshSession(id, user, hash(secret), expiresAt));
        return new IssuedToken(id + "." + secret, expiresAt);
    }

    @Transactional
    public Optional<RotatedToken> rotate(String token) {
        TokenParts parts = parse(token);
        if (parts == null) return Optional.empty();
        Optional<RefreshSession> found = sessions.findLocked(parts.id());
        if (found.isEmpty()) return Optional.empty();
        RefreshSession session = found.get();
        String presentedHash = hash(parts.secret());
        if (Instant.now().isAfter(session.getExpiresAt())) {
            sessions.delete(session);
            return Optional.empty();
        }
        if (!sameHash(session.getTokenHash(), presentedHash)) {
            if (session.getPreviousHash() != null && sameHash(session.getPreviousHash(), presentedHash)) {
                sessions.delete(session);
            }
            return Optional.empty();
        }
        String newSecret = newSecret();
        session.setPreviousHash(session.getTokenHash());
        session.setTokenHash(hash(newSecret));
        return Optional.of(new RotatedToken(session.getUser().getId(), parts.id() + "." + newSecret,
                session.getExpiresAt()));
    }

    @Transactional
    public void revoke(String token) {
        TokenParts parts = parse(token);
        if (parts == null) return;
        sessions.findLocked(parts.id()).ifPresent(session -> {
            if (sameHash(session.getTokenHash(), hash(parts.secret()))) sessions.delete(session);
        });
    }

    private String newSecret() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private static boolean sameHash(String a, String b) {
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.US_ASCII), b.getBytes(StandardCharsets.US_ASCII));
    }

    private static TokenParts parse(String token) {
        if (token == null) return null;
        String[] parts = token.split("\\.", -1);
        if (parts.length != 2 || !parts[1].matches("[A-Za-z0-9_-]{43}")) return null;
        try {
            return new TokenParts(UUID.fromString(parts[0]), parts[1]);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private record TokenParts(UUID id, String secret) {}
    public record IssuedToken(String value, Instant expiresAt) {}
    public record RotatedToken(Long userId, String value, Instant expiresAt) {}
}
