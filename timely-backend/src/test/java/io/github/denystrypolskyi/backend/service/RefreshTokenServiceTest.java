package io.github.denystrypolskyi.backend.service;

import io.github.denystrypolskyi.backend.model.CustomUserDetails;
import io.github.denystrypolskyi.backend.model.Role;
import io.github.denystrypolskyi.backend.model.UserEntity;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {
    private static final String SECRET = "a-secure-test-secret-that-is-long-enough";

    @Mock
    private JWTService jwtService;
    @Mock
    private CustomUserDetailsService userDetailsService;

    private RefreshTokenService refreshTokenService;
    private CustomUserDetails user;

    @BeforeEach
    void setUp() {
        refreshTokenService = new RefreshTokenService(
                SECRET,
                2_592_000_000L,
                "timely-backend",
                "timely-refresh",
                jwtService,
                userDetailsService);

        UserEntity entity = new UserEntity();
        entity.setId(42L);
        entity.setUsername("alice");
        entity.setRole(Role.USER);
        entity.setTokenVersion(3L);
        user = new CustomUserDetails(entity);
    }

    @Test
    void generatedTokenContainsUserIdAndTokenVersion() {
        String token = refreshTokenService.generateToken(user);

        RefreshTokenService.TokenClaims claims = refreshTokenService.parseToken(token);

        assertEquals(42L, claims.userId());
        assertEquals(3L, claims.tokenVersion());
    }

    @Test
    void renewShouldIssueNewAccessAndRefreshTokens() {
        String token = refreshTokenService.generateToken(user);
        when(userDetailsService.loadUserById(42L)).thenReturn(user);
        when(jwtService.generateToken(user)).thenReturn("new-access-token");

        Optional<RefreshTokenService.RefreshedTokens> result = refreshTokenService.renew(token);

        assertTrue(result.isPresent());
        assertEquals("new-access-token", result.orElseThrow().accessToken());
        refreshTokenService.parseToken(result.orElseThrow().refreshToken());
    }

    @Test
    void renewShouldRejectTokenAfterPasswordTokenVersionChanges() {
        String token = refreshTokenService.generateToken(user);
        UserEntity updatedEntity = new UserEntity();
        updatedEntity.setId(42L);
        updatedEntity.setUsername("alice");
        updatedEntity.setRole(Role.USER);
        updatedEntity.setTokenVersion(4L);
        when(userDetailsService.loadUserById(42L)).thenReturn(new CustomUserDetails(updatedEntity));

        assertTrue(refreshTokenService.renew(token).isEmpty());
        verifyNoInteractions(jwtService);
    }

    @Test
    void accessTokenCannotBeUsedAsRefreshToken() {
        JWTService accessTokenService = new JWTService(
                SECRET, 60_000, "timely-backend", "timely-api");
        String accessToken = accessTokenService.generateToken(user);

        assertThrows(JwtException.class, () -> refreshTokenService.parseToken(accessToken));
    }
}
