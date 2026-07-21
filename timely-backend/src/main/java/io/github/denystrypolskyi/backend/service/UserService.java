package io.github.denystrypolskyi.backend.service;

import io.github.denystrypolskyi.backend.dto.CreateUserRequest;
import io.github.denystrypolskyi.backend.dto.UpdatePasswordRequest;
import io.github.denystrypolskyi.backend.dto.UpdateUsernameRequest;
import io.github.denystrypolskyi.backend.exception.DuplicateResourceException;
import io.github.denystrypolskyi.backend.exception.ResourceNotFoundException;
import io.github.denystrypolskyi.backend.model.Role;
import io.github.denystrypolskyi.backend.model.UserEntity;
import io.github.denystrypolskyi.backend.repository.UserRepository;

import java.util.List;
import java.util.Objects;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserEntity createUser(CreateUserRequest user) {
        PasswordPolicy.validate(user.password());

        if (userRepository.existsByUsername(user.username())) {
            throw new DuplicateResourceException("Username already exists");
        }

        UserEntity newUser = new UserEntity();
        newUser.setUsername(user.username());
        newUser.setPassword(passwordEncoder.encode(user.password()));
        newUser.setRole(Role.USER); // default role

        return userRepository.save(newUser);
    }

    public UserEntity getUserById(Long userId) {
        Objects.requireNonNull(userId, "User ID must be provided");
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserEntity getByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public UserEntity getByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<UserEntity> getUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void deleteUserById(Long userId) {
        UserEntity user = getUserById(userId);
        userRepository.delete(user);
    }

    @Transactional
    public UserEntity updateUsername(Long userId, UpdateUsernameRequest dto) {
        Objects.requireNonNull(userId, "User ID must be provided");

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserEntity existingUser = userRepository.findByUsername(dto.username());
        if (existingUser != null && !Objects.equals(existingUser.getId(), user.getId())) {
            throw new DuplicateResourceException("Username already exists");
        }

        user.setUsername(dto.username());
        return userRepository.save(user);
    }

    @Transactional
    public void updatePassword(Long userId, UpdatePasswordRequest dto) {
        Objects.requireNonNull(userId, "User ID must be provided");
        PasswordPolicy.validate(dto.newPassword());

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getPassword() == null || !passwordEncoder.matches(dto.oldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
    }

}
