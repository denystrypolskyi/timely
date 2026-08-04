package io.github.denystrypolskyi.backend.controller;

import io.github.denystrypolskyi.backend.dto.*;
import io.github.denystrypolskyi.backend.config.AppProperties;
import io.github.denystrypolskyi.backend.mapper.UserMapper;
import io.github.denystrypolskyi.backend.model.CustomUserDetails;
import io.github.denystrypolskyi.backend.model.UserEntity;
import io.github.denystrypolskyi.backend.service.AuthService;
import io.github.denystrypolskyi.backend.service.JwtCookieService;
import io.github.denystrypolskyi.backend.service.RefreshTokenService;
import io.github.denystrypolskyi.backend.service.RefreshTokenCookieService;
import io.github.denystrypolskyi.backend.service.UserService;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    public final UserService userService;
    public final AuthService authService;
    public final UserMapper userMapper;
    private final AppProperties appProperties;
    private final JwtCookieService jwtCookieService;
    private final RefreshTokenCookieService refreshTokenCookieService;
    private final RefreshTokenService refreshTokenService;

    @Autowired
    public UserController(UserService userService, AuthService authService, UserMapper userMapper,
                          AppProperties appProperties, JwtCookieService jwtCookieService,
                          RefreshTokenCookieService refreshTokenCookieService,
                          RefreshTokenService refreshTokenService) {
        this.userService = userService;
        this.authService = authService;
        this.userMapper = userMapper;
        this.appProperties = appProperties;
        this.jwtCookieService = jwtCookieService;
        this.refreshTokenCookieService = refreshTokenCookieService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/register")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserResponse> createUser(@RequestBody @Valid CreateUserRequest request) {
        if (!appProperties.isRegistrationEnabled()) {
            throw new org.springframework.security.access.AccessDeniedException("Registration is disabled");
        }
        UserEntity newUser = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toDTO(newUser));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteUserById(@PathVariable Long userId) {
        userService.deleteUserById(userId);

        return ResponseEntity.noContent().build();
    }


    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody @Valid LoginRequest request) {
        AuthService.LoginResult result = authService.login(request);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.SET_COOKIE, jwtCookieService.create(result.accessToken()).toString())
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieService.create(result.refreshToken()).toString())
                .body(new TokenResponse(result.accessToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, jwtCookieService.clear().toString())
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieService.clear().toString())
                .build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(HttpServletRequest request) {
        return refreshTokenCookieService.read(request)
                .flatMap(refreshTokenService::renew)
                .map(result -> ResponseEntity.ok()
                        .cacheControl(CacheControl.noStore())
                        .header(HttpHeaders.SET_COOKIE, jwtCookieService.create(result.accessToken()).toString())
                        .header(HttpHeaders.SET_COOKIE,
                                refreshTokenCookieService.create(result.refreshToken()).toString())
                        .body(new TokenResponse(result.accessToken())))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .cacheControl(CacheControl.noStore())
                        .header(HttpHeaders.SET_COOKIE, jwtCookieService.clear().toString())
                        .header(HttpHeaders.SET_COOKIE, refreshTokenCookieService.clear().toString())
                        .build());
    }

    @GetMapping()
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<UserResponse>> getUsers() {
        List<UserEntity> userEntities = userService.getUsers();

        List<UserResponse> users = userEntities.stream().map(userMapper::toDTO).toList();
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/username")
    public ResponseEntity<Void> updateUsername(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody @Valid UpdateUsernameRequest dto) {
        userService.updateUsername(user.getId(), dto);

        return ResponseEntity.ok().build();
    }

    @PatchMapping("/password")
    public ResponseEntity<Void> updatePassword(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody @Valid UpdatePasswordRequest dto) {

        userService.updatePassword(user.getId(), dto);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getLoggedInUser(@AuthenticationPrincipal CustomUserDetails user) {
        if (user == null) {
            return ResponseEntity.noContent().build();
        }

        UserEntity foundUser = userService.getUserById(user.getId());
        return ResponseEntity.ok(userMapper.toDTO(foundUser));
    }
}
