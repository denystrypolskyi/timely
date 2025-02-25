package com.example.demo.controller;

import com.example.demo.dto.TokenDTO;
import com.example.demo.dto.UserResponseDTO;
import com.example.demo.dto.UserUpdatePasswordDTO;
import com.example.demo.dto.UserUpdateUsernameDTO;
import com.example.demo.dto.UserAuthDTO;
import com.example.demo.model.User;
import com.example.demo.service.AuthService;
import com.example.demo.service.UserService;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    public final UserService userService;
    public final AuthService authService;

    @Autowired
    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @PostMapping("/register")
    public Map<String, String> createUser(@RequestBody UserAuthDTO user) {
        userService.createUser(user);
        return Map.of("message", "User registered successfully");
    }

    @DeleteMapping("/{userId}")
    public Map<String, String> deleteUserById(@PathVariable("userId") Long userId) {
        userService.deleteUserById(userId);
        return Map.of("message", "User deleted successfully");
    }

    @PostMapping("/login")
    public TokenDTO login(@RequestBody UserAuthDTO loginDTO) {
        String token = authService.verify(loginDTO);
        return new TokenDTO(token);
    }

    @GetMapping("/")
    public List<User> getUsers() {
        return userService.getUsers();
    }

    @PatchMapping("/username")
    public Map<String, String> updateUsername(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody UserUpdateUsernameDTO dto) {
        String token = authorizationHeader.split(" ")[1];
        Long userId = authService.getUserIdFromToken(token);

        userService.updateUsername(userId, dto);
        return Map.of("message", "Username updated successfully");
    }

    @PatchMapping("/password")
    public Map<String, String> updatePassword(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody UserUpdatePasswordDTO dto) {
        String token = authorizationHeader.split(" ")[1];
        Long userId = authService.getUserIdFromToken(token);

        userService.updatePassword(userId, dto);
        return Map.of("message", "Password updated successfully");
    }

    @GetMapping("/profile")
    public UserResponseDTO getLoggedInUser(@RequestHeader("Authorization") String authorizationHeader) {
        String token = authorizationHeader.split(" ")[1];
        Long userId = authService.getUserIdFromToken(token);
        User user = userService.getUserById(userId);

        UserResponseDTO userDTO = new UserResponseDTO(user.getId(), user.getUsername(), user.getRole());
        return userDTO;
    }
}