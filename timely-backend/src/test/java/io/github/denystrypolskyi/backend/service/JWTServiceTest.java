package io.github.denystrypolskyi.backend.service;

import io.github.denystrypolskyi.backend.model.CustomUserDetails;
import io.github.denystrypolskyi.backend.model.Role;
import io.github.denystrypolskyi.backend.model.UserEntity;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JWTServiceTest {
    private static final String SECRET = "a-secure-test-secret-that-is-long-enough";

    @Test
    void generatedTokenContainsImmutableUserIdAndTokenVersion() {
        JWTService service = new JWTService(SECRET, 60_000, "timely-backend", "timely-api");
        UserEntity user = new UserEntity();
        user.setId(42L);
        user.setUsername("alice");
        user.setRole(Role.USER);
        user.setTokenVersion(3L);

        String token = service.generateToken(new CustomUserDetails(user));
        JWTService.TokenClaims claims = service.parseToken(token);

        assertEquals(42L, claims.userId());
        assertEquals(3L, claims.tokenVersion());
    }

    @Test
    void tokenForAnotherIssuerIsRejected() {
        JWTService issuer = new JWTService(SECRET, 60_000, "first-issuer", "timely-api");
        JWTService verifier = new JWTService(SECRET, 60_000, "second-issuer", "timely-api");
        UserEntity user = new UserEntity();
        user.setId(42L);
        user.setUsername("alice");
        user.setRole(Role.USER);

        String token = issuer.generateToken(new CustomUserDetails(user));

        assertThrows(JwtException.class, () -> verifier.parseToken(token));
    }
}
