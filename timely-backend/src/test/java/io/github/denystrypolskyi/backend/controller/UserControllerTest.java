package io.github.denystrypolskyi.backend.controller;

import io.github.denystrypolskyi.backend.config.AppProperties;
import io.github.denystrypolskyi.backend.dto.LoginRequest;
import io.github.denystrypolskyi.backend.dto.TokenResponse;
import io.github.denystrypolskyi.backend.dto.UserResponse;
import io.github.denystrypolskyi.backend.mapper.UserMapper;
import io.github.denystrypolskyi.backend.service.AuthService;
import io.github.denystrypolskyi.backend.service.JwtCookieService;
import io.github.denystrypolskyi.backend.service.RefreshTokenCookieService;
import io.github.denystrypolskyi.backend.service.RefreshTokenService;
import io.github.denystrypolskyi.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {
    @Mock
    private UserService userService;

    @Mock
    private AuthService authService;

    @Mock
    private UserMapper userMapper;

    @Mock
    private AppProperties appProperties;

    @Mock
    private JwtCookieService jwtCookieService;

    @Mock
    private RefreshTokenCookieService refreshTokenCookieService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private UserController userController;

    @Test
    void getLoggedInUser_shouldReturnNoContentForAnonymousRequest() {
        ResponseEntity<UserResponse> response = userController.getLoggedInUser(null);

        assertEquals(204, response.getStatusCode().value());
        assertNull(response.getBody());
        verifyNoInteractions(userService, userMapper);
    }

    @Test
    void login_shouldSetAccessAndRefreshCookies() {
        LoginRequest request = new LoginRequest("alice", "password1234");
        when(authService.login(request))
                .thenReturn(new AuthService.LoginResult("access-token", "refresh-token"));
        when(jwtCookieService.create("access-token"))
                .thenReturn(ResponseCookie.from("timely_access_token", "access-token").build());
        when(refreshTokenCookieService.create("refresh-token"))
                .thenReturn(ResponseCookie.from("timely_refresh_token", "refresh-token").build());

        ResponseEntity<TokenResponse> response = userController.login(request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("access-token", response.getBody().token());
        assertEquals(2, response.getHeaders().getOrEmpty(HttpHeaders.SET_COOKIE).size());
    }

    @Test
    void refresh_shouldRenewBothCookies() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        when(refreshTokenCookieService.read(request)).thenReturn(Optional.of("old-refresh-token"));
        when(refreshTokenService.renew("old-refresh-token"))
                .thenReturn(Optional.of(new RefreshTokenService.RefreshedTokens(
                        "new-access-token", "new-refresh-token")));
        when(jwtCookieService.create("new-access-token"))
                .thenReturn(ResponseCookie.from("timely_access_token", "new-access-token").build());
        when(refreshTokenCookieService.create("new-refresh-token"))
                .thenReturn(ResponseCookie.from("timely_refresh_token", "new-refresh-token").build());

        ResponseEntity<TokenResponse> response = userController.refresh(request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("new-access-token", response.getBody().token());
        List<String> cookies = response.getHeaders().getOrEmpty(HttpHeaders.SET_COOKIE);
        assertEquals(2, cookies.size());
    }
}
