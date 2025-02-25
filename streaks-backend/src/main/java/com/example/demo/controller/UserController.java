package com.example.demo.controller;

import com.example.demo.dto.TokenDTO;
import com.example.demo.model.User;
import com.example.demo.model.UserDTO;
import com.example.demo.service.AuthService;
import com.example.demo.service.UserService;

import java.util.List;

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
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

    @PostMapping("/login")
    public TokenDTO login(@RequestBody User user) {
        String token = authService.verify(user);
        return new TokenDTO(token);
    }

    @GetMapping("/")
    public List<User> getUsers() {
        return userService.getUsers();
    }

    @DeleteMapping("/{userId}")
    public List<User> deleteUserById(@PathVariable("userId") Long userId) {
        userService.deleteUserById(userId);
        return userService.getUsers();
    }

    @PutMapping("/{userId}")
    public User editUser(@PathVariable("userId") Long userId, @RequestBody User updatedUser) {
        return userService.updateUser(userId, updatedUser);
    }

    @GetMapping("/profile")
    public UserDTO getLoggedInUser(@RequestHeader("Authorization") String authorizationHeader) {
        String token = authorizationHeader.split(" ")[1];
        Long userId = authService.getUserIdFromToken(token);
        User user = userService.getUserById(userId);

        UserDTO userDTO = new UserDTO(user.getId(), user.getUsername(), user.getRole());
        return userDTO;
    }
}