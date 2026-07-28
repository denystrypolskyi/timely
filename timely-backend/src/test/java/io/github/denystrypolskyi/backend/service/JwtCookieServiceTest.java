package io.github.denystrypolskyi.backend.service;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;
import org.springframework.mock.web.MockHttpServletRequest;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtCookieServiceTest {

    @Test
    void create_shouldBuildProtectedAuthenticationCookie() {
        JwtCookieService service = new JwtCookieService(true, "Strict", 3_600_000);

        ResponseCookie cookie = service.create("signed-jwt");

        assertEquals("timely_access_token", cookie.getName());
        assertEquals("signed-jwt", cookie.getValue());
        assertEquals("/api", cookie.getPath());
        assertEquals(Duration.ofHours(1), cookie.getMaxAge());
        assertEquals("Strict", cookie.getSameSite());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.isSecure());
    }

    @Test
    void readAndClear_shouldHandleAuthenticationCookie() {
        JwtCookieService service = new JwtCookieService(false, "Strict", 3_600_000);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("other", "value"),
                new Cookie("timely_access_token", "signed-jwt"));

        assertEquals("signed-jwt", service.read(request).orElseThrow());

        ResponseCookie clearedCookie = service.clear();
        assertEquals("", clearedCookie.getValue());
        assertEquals(Duration.ZERO, clearedCookie.getMaxAge());
        assertTrue(clearedCookie.isHttpOnly());
        assertFalse(clearedCookie.isSecure());
    }
}
