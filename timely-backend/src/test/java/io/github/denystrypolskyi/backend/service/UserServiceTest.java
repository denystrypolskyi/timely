package io.github.denystrypolskyi.backend.service;

import io.github.denystrypolskyi.backend.dto.CreateUserRequest;
import io.github.denystrypolskyi.backend.dto.UpdatePasswordRequest;
import io.github.denystrypolskyi.backend.dto.UpdateUsernameRequest;
import io.github.denystrypolskyi.backend.exception.DuplicateResourceException;
import io.github.denystrypolskyi.backend.exception.ResourceNotFoundException;
import io.github.denystrypolskyi.backend.model.Role;
import io.github.denystrypolskyi.backend.model.UserEntity;
import io.github.denystrypolskyi.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void createUser_shouldSaveUserWithEncodedPasswordAndDefaultRole() {
        CreateUserRequest request = new CreateUserRequest("alice", "password123");

        when(userRepository.existsByUsername("alice")).thenReturn(false);
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserEntity result = userService.createUser(request);

        assertEquals("alice", result.getUsername());
        assertEquals(Role.USER, result.getRole());
        assertNotEquals("password123", result.getPassword());
        assertTrue(new BCryptPasswordEncoder(12).matches("password123", result.getPassword()));
        verify(userRepository).save(any(UserEntity.class));
    }

    @Test
    void createUser_shouldThrowConflict_whenUsernameAlreadyExists() {
        CreateUserRequest request = new CreateUserRequest("alice", "password123");

        when(userRepository.existsByUsername("alice")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> userService.createUser(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void getUserById_shouldReturnUser_whenUserExists() {
        UserEntity user = userWithIdAndUsername(1L, "alice");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        UserEntity result = userService.getUserById(1L);

        assertSame(user, result);
    }

    @Test
    void getUserById_shouldThrowNotFound_whenUserDoesNotExist() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(1L));
    }

    @Test
    void deleteUserById_shouldDeleteExistingUser() {
        UserEntity user = userWithIdAndUsername(1L, "alice");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.deleteUserById(1L);

        verify(userRepository).delete(user);
    }

    @Test
    void updateUsername_shouldSaveNewUsername_whenUsernameIsAvailable() {
        UserEntity user = userWithIdAndUsername(1L, "alice");
        UpdateUsernameRequest request = new UpdateUsernameRequest("alice-new");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.findByUsername("alice-new")).thenReturn(null);
        when(userRepository.save(user)).thenReturn(user);

        UserEntity result = userService.updateUsername(1L, request);

        assertEquals("alice-new", result.getUsername());
        verify(userRepository).save(user);
    }

    @Test
    void updateUsername_shouldThrowConflict_whenUsernameBelongsToAnotherUser() {
        UserEntity user = userWithIdAndUsername(1L, "alice");
        UserEntity existingUser = userWithIdAndUsername(2L, "bob");
        UpdateUsernameRequest request = new UpdateUsernameRequest("bob");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.findByUsername("bob")).thenReturn(existingUser);

        assertThrows(DuplicateResourceException.class, () -> userService.updateUsername(1L, request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void updatePassword_shouldSaveEncodedNewPassword_whenOldPasswordMatches() {
        UserEntity user = userWithIdAndUsername(1L, "alice");
        user.setPassword(new BCryptPasswordEncoder(12).encode("old-password"));
        UpdatePasswordRequest request = new UpdatePasswordRequest("old-password", "new-password");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.updatePassword(1L, request);

        assertTrue(new BCryptPasswordEncoder(12).matches("new-password", user.getPassword()));
        verify(userRepository).save(user);
    }

    @Test
    void updatePassword_shouldThrowBadRequest_whenOldPasswordDoesNotMatch() {
        UserEntity user = userWithIdAndUsername(1L, "alice");
        user.setPassword(new BCryptPasswordEncoder(12).encode("old-password"));
        UpdatePasswordRequest request = new UpdatePasswordRequest("wrong-password", "new-password");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class, () -> userService.updatePassword(1L, request));
        verify(userRepository, never()).save(any());
    }

    private UserEntity userWithIdAndUsername(Long id, String username) {
        UserEntity user = new UserEntity();
        user.setId(id);
        user.setUsername(username);
        return user;
    }
}
