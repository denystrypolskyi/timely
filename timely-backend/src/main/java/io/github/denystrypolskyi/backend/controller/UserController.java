package io.github.denystrypolskyi.backend.controller;

import io.github.denystrypolskyi.backend.dto.*;
import io.github.denystrypolskyi.backend.config.AppProperties;
import io.github.denystrypolskyi.backend.mapper.UserMapper;
import io.github.denystrypolskyi.backend.model.CustomUserDetails;
import io.github.denystrypolskyi.backend.model.UserEntity;
import io.github.denystrypolskyi.backend.service.AuthService;
import io.github.denystrypolskyi.backend.service.JwtCookieService;
import io.github.denystrypolskyi.backend.service.RefreshCookieService;
import io.github.denystrypolskyi.backend.service.RefreshTokenService;
import io.github.denystrypolskyi.backend.service.UserService;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    public final UserService userService;
    public final AuthService authService;
    public final UserMapper userMapper;
    private final AppProperties appProperties;
    private final JwtCookieService jwtCookieService;
    private final RefreshCookieService refreshCookieService;
    private final RefreshTokenService refreshTokenService;

    @Autowired
    public UserController(UserService userService, AuthService authService, UserMapper userMapper,
                          AppProperties appProperties, JwtCookieService jwtCookieService,
                          RefreshCookieService refreshCookieService, RefreshTokenService refreshTokenService) {
        this.userService = userService;
        this.authService = authService;
        this.userMapper = userMapper;
        this.appProperties = appProperties;
        this.jwtCookieService = jwtCookieService;
        this.refreshCookieService = refreshCookieService;
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
    public ResponseEntity<Void> login(@RequestBody @Valid LoginRequest request) {
        AuthService.Tokens tokens = authService.login(request);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.SET_COOKIE, jwtCookieService.create(tokens.accessToken()).toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookieService.create(tokens.refreshToken(), tokens.refreshExpiresAt()).toString())
                .build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh(HttpServletRequest request) {
        if (!validOrigin(request)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        String token = refreshCookieService.read(request).orElse(null);
        var rotated = refreshTokenService.rotate(token);
        if (rotated.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .header(HttpHeaders.SET_COOKIE, jwtCookieService.clear().toString())
                    .header(HttpHeaders.SET_COOKIE, refreshCookieService.clear().toString())
                    .build();
        }
        var result = rotated.get();
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .header(HttpHeaders.SET_COOKIE, jwtCookieService.create(authService.accessToken(result.userId())).toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookieService.create(result.value(), result.expiresAt()).toString())
                .build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        if (!validOrigin(request)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        refreshCookieService.read(request).ifPresent(refreshTokenService::revoke);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, jwtCookieService.clear().toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookieService.clear().toString())
                .build();
    }

    private boolean validOrigin(HttpServletRequest request) {
        String origin = request.getHeader("Origin");
        if (origin == null) return false;
        try {
            URI supplied = URI.create(origin);
            String allowed = appProperties.getFrontendUrl();
            return sameOrigin(supplied, URI.create(request.getScheme() + "://" + request.getServerName()
                    + ":" + request.getServerPort()))
                    || (allowed != null && sameOrigin(supplied, URI.create(allowed)));
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private static boolean sameOrigin(URI first, URI second) {
        return first.getScheme() != null && first.getHost() != null
                && (first.getRawPath() == null || first.getRawPath().isEmpty())
                && first.getRawQuery() == null && first.getRawFragment() == null
                && first.getRawUserInfo() == null
                && first.getScheme().equalsIgnoreCase(second.getScheme())
                && first.getHost().equalsIgnoreCase(second.getHost())
                && port(first) == port(second);
    }

    private static int port(URI uri) {
        if (uri.getPort() != -1) return uri.getPort();
        return "https".equalsIgnoreCase(uri.getScheme()) ? 443 : 80;
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

    @PatchMapping("/timezone")
    public ResponseEntity<UserResponse> updateTimeZone(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody @Valid UpdateTimeZoneRequest dto) {
        UserEntity updatedUser = userService.updateTimeZone(user.getId(), dto);
        return ResponseEntity.ok(userMapper.toDTO(updatedUser));
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
