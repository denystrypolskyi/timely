package io.github.denystrypolskyi.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class OAuth2LoginCodeServiceTest {

    @Test
    void loginCodeCanOnlyBeRedeemedOnce() {
        OAuth2LoginCodeService service = new OAuth2LoginCodeService();
        String code = service.issue(42L);

        assertEquals(42L, service.redeem(code));
        assertThrows(BadCredentialsException.class, () -> service.redeem(code));
    }

    @Test
    void unknownCodeIsRejected() {
        OAuth2LoginCodeService service = new OAuth2LoginCodeService();

        assertThrows(BadCredentialsException.class, () -> service.redeem("not-a-real-code"));
    }
}
