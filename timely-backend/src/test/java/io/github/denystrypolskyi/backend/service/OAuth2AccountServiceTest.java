package io.github.denystrypolskyi.backend.service;

import io.github.denystrypolskyi.backend.model.OAuthProvider;
import io.github.denystrypolskyi.backend.model.UserEntity;
import io.github.denystrypolskyi.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OAuth2AccountServiceTest {
    @Mock
    private UserRepository userRepository;

    @Test
    void createsAccountUsingGoogleSubjectInsteadOfEmailAsIdentity() {
        OAuth2AccountService service = new OAuth2AccountService(userRepository);
        OAuth2User googleUser = googleUser(true);
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.findOrCreateGoogleUser(googleUser);

        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository).save(captor.capture());
        UserEntity savedUser = captor.getValue();
        assertEquals(OAuthProvider.GOOGLE, savedUser.getOauthProvider());
        assertEquals("google-subject", savedUser.getOauthSubject());
        assertEquals("alice@example.com", savedUser.getEmail());
        assertTrue(savedUser.getUsername().startsWith("google_"));
        assertNull(savedUser.getPassword());
    }

    @Test
    void doesNotAutomaticallyLinkGoogleToAPasswordAccount() {
        OAuth2AccountService service = new OAuth2AccountService(userRepository);
        UserEntity passwordAccount = new UserEntity();
        passwordAccount.setPassword("encoded-password");
        when(userRepository.findByEmail("alice@example.com")).thenReturn(passwordAccount);

        assertThrows(BadCredentialsException.class, () -> service.findOrCreateGoogleUser(googleUser(true)));
        verify(userRepository, never()).save(any());
    }

    @Test
    void rejectsUnverifiedGoogleEmail() {
        OAuth2AccountService service = new OAuth2AccountService(userRepository);

        assertThrows(BadCredentialsException.class, () -> service.findOrCreateGoogleUser(googleUser(false)));
        verify(userRepository, never()).save(any());
    }

    private static OAuth2User googleUser(boolean emailVerified) {
        return new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("OAUTH2_USER")),
                Map.of(
                        "sub", "google-subject",
                        "email", "alice@example.com",
                        "email_verified", emailVerified,
                        "name", "Alice"
                ),
                "sub"
        );
    }
}
