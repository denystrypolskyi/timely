package com.example.demo.controller;

import com.example.demo.model.Hours;
import com.example.demo.service.AuthService;
import com.example.demo.service.HoursService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/hours")
public class HoursController {
    private final HoursService hoursService;
    private final AuthService authService;

    public HoursController(HoursService hoursService, AuthService authService) {
        this.hoursService = hoursService;
        this.authService = authService;
    }

    @GetMapping("/user")
    public ResponseEntity<List<Hours>> getHoursForCurrentUser(
            @RequestHeader("Authorization") String authorizationHeader) {
        Long userId = extractUserIdFromHeader(authorizationHeader);
        return hoursService.getHoursByUser(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Hours> logWorkHours(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody Map<String, String> requestBody) {
        try {
            Long userId = extractUserIdFromHeader(authorizationHeader);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
            LocalDateTime shiftStart = LocalDateTime.parse(requestBody.get("shiftStart"), formatter);
            LocalDateTime shiftEnd = LocalDateTime.parse(requestBody.get("shiftEnd"), formatter);

            Optional<Hours> loggedHours = hoursService.logWorkHours(userId, shiftStart, shiftEnd);

            return loggedHours.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkHours(@PathVariable Long id) {
        return hoursService.deleteWorkHours(id) ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    private Long extractUserIdFromHeader(String authorizationHeader) {
        String token = authorizationHeader.split(" ")[1];
        return authService.getUserIdFromToken(token);
    }
}
