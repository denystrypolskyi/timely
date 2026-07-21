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
    private final OAuth2LoginCodeService oauth2LoginCodeService;
    private final CustomUserDetailsService userDetailsService;

    @Autowired
    public AuthService(AuthenticationManager authenticationManager,
                       JWTService jwtService,
                       OAuth2LoginCodeService oauth2LoginCodeService,
                       CustomUserDetailsService userDetailsService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.oauth2LoginCodeService = oauth2LoginCodeService;
        this.userDetailsService = userDetailsService;
    }

    public String login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        return jwtService.generateToken(principal);
    }

    public String exchangeOAuth2Code(String code) {
        Long userId = oauth2LoginCodeService.redeem(code);
        CustomUserDetails principal = userDetailsService.loadUserById(userId);
        return jwtService.generateToken(principal);
    }
}
