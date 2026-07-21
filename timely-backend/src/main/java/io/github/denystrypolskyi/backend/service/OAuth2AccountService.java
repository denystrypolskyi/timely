package io.github.denystrypolskyi.backend.service;

import io.github.denystrypolskyi.backend.model.OAuthProvider;
import io.github.denystrypolskyi.backend.model.UserEntity;
import io.github.denystrypolskyi.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class OAuth2AccountService {
    private final UserRepository userRepository;

    public OAuth2AccountService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public UserEntity findOrCreateGoogleUser(OAuth2User oauthUser) {
        String subject = requiredAttribute(oauthUser, "sub");
        String email = requiredAttribute(oauthUser, "email");
        String fullName = oauthUser.getAttribute("name");

        if (!isVerifiedEmail(oauthUser.getAttribute("email_verified"))) {
            throw new BadCredentialsException("Google email is not verified");
        }

        UserEntity user = userRepository.findByOauthProviderAndOauthSubject(OAuthProvider.GOOGLE, subject);
        if (user != null) {
            user.setFullName(fullName);
            return userRepository.save(user);
        }

        UserEntity existingEmailUser = userRepository.findByEmail(email);
        if (existingEmailUser != null) {
            if (existingEmailUser.getPassword() != null || existingEmailUser.getOauthProvider() != null) {
                throw new BadCredentialsException("Google account cannot be linked automatically");
            }

            existingEmailUser.setOauthProvider(OAuthProvider.GOOGLE);
            existingEmailUser.setOauthSubject(subject);
            existingEmailUser.setFullName(fullName);
            return userRepository.save(existingEmailUser);
        }

        UserEntity newUser = new UserEntity();
        newUser.setUsername("google_" + UUID.randomUUID().toString().replace("-", ""));
        newUser.setEmail(email);
        newUser.setFullName(fullName);
        newUser.setOauthProvider(OAuthProvider.GOOGLE);
        newUser.setOauthSubject(subject);
        return userRepository.save(newUser);
    }

    private static String requiredAttribute(OAuth2User user, String name) {
        String value = user.getAttribute(name);
        if (value == null || value.isBlank()) {
            throw new BadCredentialsException("Google account is missing " + name);
        }
        return value;
    }

    private static boolean isVerifiedEmail(Object value) {
        return Boolean.TRUE.equals(value) || "true".equalsIgnoreCase(String.valueOf(value));
    }
}
