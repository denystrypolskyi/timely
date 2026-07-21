package io.github.denystrypolskyi.backend.config;

import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import io.github.denystrypolskyi.backend.model.UserEntity;
import io.github.denystrypolskyi.backend.service.OAuth2AccountService;
import io.github.denystrypolskyi.backend.service.OAuth2LoginCodeService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
    private final OAuth2AccountService accountService;
    private final OAuth2LoginCodeService loginCodeService;
    private final AppProperties appProperties;

    @Autowired
    public OAuth2SuccessHandler(OAuth2AccountService accountService,
                                OAuth2LoginCodeService loginCodeService,
                                AppProperties appProperties) {
        this.accountService = accountService;
        this.loginCodeService = loginCodeService;
        this.appProperties = appProperties;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            UserEntity user = accountService.findOrCreateGoogleUser(oAuth2User);
            String loginCode = loginCodeService.issue(user.getId());
            String redirectUrl = UriComponentsBuilder
                    .fromUriString(appProperties.getOauth2RedirectUrl())
                    .queryParam("code", loginCode)
                    .build()
                    .encode()
                    .toUriString();

            response.setHeader("Cache-Control", "no-store");
            response.setHeader("Referrer-Policy", "no-referrer");
            response.sendRedirect(redirectUrl);
        } catch (BadCredentialsException exception) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "OAuth login failed");
        }
    }
}
