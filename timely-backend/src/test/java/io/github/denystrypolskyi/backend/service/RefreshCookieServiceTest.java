package io.github.denystrypolskyi.backend.service;

import org.junit.jupiter.api.Test;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class RefreshCookieServiceTest {
    @Test
    void refreshCookieIsProtectedAndScopedToUserEndpoints() {
        var cookie = new RefreshCookieService(true, "Strict")
                .create("refresh-token", Instant.now().plusSeconds(3600));

        assertEquals("timely_refresh_token", cookie.getName());
        assertEquals("/api/users", cookie.getPath());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.isSecure());
        assertEquals("Strict", cookie.getSameSite());
        assertTrue(cookie.getMaxAge().getSeconds() > 0);
    }
}
