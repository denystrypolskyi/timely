package com.example.demo.service;

import com.example.demo.dto.UserAuthDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;
    private final UserService userService;

    @Autowired
    public AuthService(AuthenticationManager authenticationManager, JWTService jwtService, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    public String verify(UserAuthDTO user) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));

        if (authentication.isAuthenticated()) {
            String username = user.getUsername();
            Long userId = userService.getByUsername(username).getId();
            return jwtService.generateToken(username, userId);
        } else {
            return "Not Authenticated";
        }
    }

    public Long getUserIdFromToken(String token) {
        return jwtService.extractUserId(token);
    }
}
