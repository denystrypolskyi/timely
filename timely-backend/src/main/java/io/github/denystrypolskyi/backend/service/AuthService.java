package io.github.denystrypolskyi.backend.service;

import io.github.denystrypolskyi.backend.dto.LoginRequest;
import io.github.denystrypolskyi.backend.model.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Autowired
    public AuthService(AuthenticationManager authenticationManager,
                       JWTService jwtService, RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    public Tokens login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        RefreshTokenService.IssuedToken refresh = refreshTokenService.create(principal.getId());
        return new Tokens(jwtService.generateToken(principal.getId()), refresh.value(), refresh.expiresAt());
    }

    public String accessToken(Long userId) { return jwtService.generateToken(userId); }

    public record Tokens(String accessToken, String refreshToken, java.time.Instant refreshExpiresAt) {}
}
