package io.github.denystrypolskyi.backend.service;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JWTServiceTest {
    private static final String SECRET = "a-secure-test-secret-that-is-long-enough";

    @Test
    void generatedTokenContainsUserId() {
        JWTService service = new JWTService(SECRET, 60_000);

        String token = service.generateToken(42L);

        assertEquals(42L, service.parseUserId(token));
    }

    @Test
    void tokenSignedWithAnotherSecretIsRejected() {
        JWTService issuer = new JWTService(SECRET, 60_000);
        JWTService verifier = new JWTService("another-secure-test-secret-that-is-long-enough", 60_000);

        String token = issuer.generateToken(42L);

        assertThrows(JwtException.class, () -> verifier.parseUserId(token));
    }
}
