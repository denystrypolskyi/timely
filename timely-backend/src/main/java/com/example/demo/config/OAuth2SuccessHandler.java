package com.example.demo.config;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.JWTService;
import com.example.demo.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JWTService jwtService;
    private final UserService userService;
    private final UserRepository userRepository;

    @Autowired
    public OAuth2SuccessHandler(JWTService jwtService, UserService userService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String fullName = oAuth2User.getAttribute("name");

        // Try to find the user by email (unique identifier)
        User user = userService.getByEmail(email);

        if (user == null) {
            user = new User();
            user.setEmail(email); // Set email as the unique identifier
            user.setUsername(email); // Set email as the username to avoid conflicts
            user.setFullName(fullName); 
            // No password is needed for Google OAuth2 users
            user = userRepository.save(user);
        }

        // Generate a JWT token based on email (since email is the unique identifier)
        String jwt = jwtService.generateToken(user.getEmail(), user.getId());

        String redirectUrl = "https://timely-front-end.web.app/oauth2/redirect?token=" +
                URLEncoder.encode(jwt, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }

}