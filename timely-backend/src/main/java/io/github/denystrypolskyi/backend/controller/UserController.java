package io.github.denystrypolskyi.backend.controller;

import io.github.denystrypolskyi.backend.dto.*;
import io.github.denystrypolskyi.backend.config.AppProperties;
import io.github.denystrypolskyi.backend.mapper.UserMapper;
import io.github.denystrypolskyi.backend.model.CustomUserDetails;
import io.github.denystrypolskyi.backend.model.UserEntity;
import io.github.denystrypolskyi.backend.service.AuthService;
import io.github.denystrypolskyi.backend.service.UserService;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.CacheControl;
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

    @Autowired
    public UserController(UserService userService, AuthService authService, UserMapper userMapper,
                          AppProperties appProperties) {
        this.userService = userService;
        this.authService = authService;
        this.userMapper = userMapper;
        this.appProperties = appProperties;
    }

    @PostMapping("/register")
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
        String token = authService.login(request);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(new TokenResponse(token));
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
        UserEntity foundUser = userService.getUserById(user.getId());
        return ResponseEntity.ok(userMapper.toDTO(foundUser));
    }
}
