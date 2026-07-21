package io.github.denystrypolskyi.backend.service;

import io.github.denystrypolskyi.backend.config.AuthenticationRateLimitFilter;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class AuthenticationRateLimitFilterTest {

    @Test
    void blocksLoginAttemptsAfterTheLimit() throws Exception {
        AuthenticationRateLimitFilter filter = new AuthenticationRateLimitFilter();

        for (int attempt = 0; attempt < 10; attempt++) {
            MockHttpServletResponse response = sendLoginRequest(filter);
            assertEquals(200, response.getStatus());
        }

        MockHttpServletResponse blockedResponse = sendLoginRequest(filter);
        assertEquals(429, blockedResponse.getStatus());
        assertNotNull(blockedResponse.getHeader("Retry-After"));
    }

    private static MockHttpServletResponse sendLoginRequest(AuthenticationRateLimitFilter filter) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/users/login");
        request.setServletPath("/api/users/login");
        request.setRemoteAddr("192.0.2.1");
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }
}
