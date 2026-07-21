package io.github.denystrypolskyi.backend.service;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class OAuth2LoginCodeService {
    private static final Duration CODE_LIFETIME = Duration.ofSeconds(60);

    private final SecureRandom secureRandom = new SecureRandom();
    private final ConcurrentMap<String, LoginCode> codes = new ConcurrentHashMap<>();

    public String issue(Long userId) {
        removeExpiredCodes();

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String code = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        codes.put(hash(code), new LoginCode(userId, Instant.now().plus(CODE_LIFETIME)));
        return code;
    }

    public Long redeem(String code) {
        LoginCode loginCode = codes.remove(hash(code));
        if (loginCode == null || loginCode.expiresAt().isBefore(Instant.now())) {
            throw new BadCredentialsException("Invalid or expired OAuth login code");
        }
        return loginCode.userId();
    }

    private void removeExpiredCodes() {
        Instant now = Instant.now();
        codes.entrySet().removeIf(entry -> entry.getValue().expiresAt().isBefore(now));
    }

    private static String hash(String code) {
        if (code == null || code.isBlank()) {
            throw new BadCredentialsException("Invalid or expired OAuth login code");
        }

        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(code.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private record LoginCode(Long userId, Instant expiresAt) {
    }
}
