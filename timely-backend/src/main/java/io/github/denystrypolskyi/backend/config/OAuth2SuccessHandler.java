package io.github.denystrypolskyi.backend.config;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import io.github.denystrypolskyi.backend.model.UserEntity;
import io.github.denystrypolskyi.backend.repository.UserRepository;
import io.github.denystrypolskyi.backend.service.JWTService;
import io.github.denystrypolskyi.backend.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
    private final JWTService jwtService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final AppProperties appProperties;

    @Autowired
    public OAuth2SuccessHandler(JWTService jwtService, UserService userService, UserRepository userRepository, AppProperties appProperties) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.userRepository = userRepository;
        this.appProperties = appProperties;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String fullName = oAuth2User.getAttribute("name");

        UserEntity user = userService.getByEmail(email);

        if (user == null) {
            user = new UserEntity();
            user.setEmail(email);
            user.setUsername(email);
            user.setFullName(fullName);
            user = userRepository.save(user);
        }

        String jwt = jwtService.generateToken(user.getEmail(), user.getId());

        String redirectUrl = appProperties.getOauth2RedirectUrl()
                + "?token=" + URLEncoder.encode(jwt, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }
}