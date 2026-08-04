package io.github.denystrypolskyi.backend.service;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;
import org.springframework.mock.web.MockHttpServletRequest;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RefreshTokenCookieServiceTest {

    @Test
    void create_shouldBuildProtectedRefreshCookie() {
        RefreshTokenCookieService service = new RefreshTokenCookieService(true, "Strict", 2_592_000_000L);

        ResponseCookie cookie = service.create("opaque-token");

        assertEquals("timely_refresh_token", cookie.getName());
        assertEquals("opaque-token", cookie.getValue());
        assertEquals("/api/users", cookie.getPath());
        assertEquals(Duration.ofDays(30), cookie.getMaxAge());
        assertEquals("Strict", cookie.getSameSite());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.isSecure());
    }

    @Test
    void readAndClear_shouldHandleRefreshCookie() {
        RefreshTokenCookieService service = new RefreshTokenCookieService(false, "Strict", 2_592_000_000L);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("other", "value"),
                new Cookie("timely_refresh_token", "opaque-token"));

        assertEquals("opaque-token", service.read(request).orElseThrow());
        assertEquals(Duration.ZERO, service.clear().getMaxAge());
    }
}
