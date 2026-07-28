package io.github.denystrypolskyi.backend.controller;

import io.github.denystrypolskyi.backend.config.AppProperties;
import io.github.denystrypolskyi.backend.dto.UserResponse;
import io.github.denystrypolskyi.backend.mapper.UserMapper;
import io.github.denystrypolskyi.backend.service.AuthService;
import io.github.denystrypolskyi.backend.service.JwtCookieService;
import io.github.denystrypolskyi.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
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

    @InjectMocks
    private UserController userController;

    @Test
    void getLoggedInUser_shouldReturnNoContentForAnonymousRequest() {
        ResponseEntity<UserResponse> response = userController.getLoggedInUser(null);

        assertEquals(204, response.getStatusCode().value());
        assertNull(response.getBody());
        verifyNoInteractions(userService, userMapper);
    }
}
