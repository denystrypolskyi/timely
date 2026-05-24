package com.example.demo.service;

import com.example.demo.dto.CreateUserRequest;
import com.example.demo.dto.UpdatePasswordRequest;
import com.example.demo.dto.UpdateUsernameRequest;
import com.example.demo.model.Role;
import com.example.demo.model.UserEntity;
import com.example.demo.repository.UserRepository;

import java.util.List;
import java.util.Objects;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    @Transactional
    public UserEntity createUser(CreateUserRequest user) {
        if (userRepository.existsByUsername(user.username())) {
            throw new IllegalArgumentException("Username already exists");
        }

        UserEntity newUser = new UserEntity();
        newUser.setUsername(user.username());
        newUser.setPassword(encoder.encode(user.password()));
        newUser.setRole(Role.USER); // default role

        return userRepository.save(newUser);
    }

    public UserEntity getUserById(Long userId) {
        Objects.requireNonNull(userId, "User ID must be provided");
        return userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
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

    public UserEntity updateUsername(Long userId, UpdateUsernameRequest dto) {
        Objects.requireNonNull(userId, "User ID must be provided");

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserEntity existingUser = userRepository.findByUsername(dto.username());
        if (existingUser != null && !Objects.equals(existingUser.getId(), user.getId())) {
            throw new IllegalArgumentException("Username already exists");
        }

        user.setUsername(dto.username());
        return userRepository.save(user);
    }

    public void updatePassword(Long userId, UpdatePasswordRequest dto) {
        Objects.requireNonNull(userId, "User ID must be provided");

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!encoder.matches(dto.oldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        user.setPassword(encoder.encode(dto.newPassword()));
        userRepository.save(user);
    }

}
