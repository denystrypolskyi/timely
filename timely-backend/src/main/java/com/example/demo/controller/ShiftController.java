package com.example.demo.controller;

import com.example.demo.model.Shift;
import com.example.demo.service.AuthService;
import com.example.demo.service.ShiftService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {
    private final ShiftService hoursService;
    private final AuthService authService;

    public ShiftController(ShiftService hoursService, AuthService authService) {
        this.hoursService = hoursService;
        this.authService = authService;
    }

    @GetMapping("/user")
    public ResponseEntity<List<Shift>> getHoursForCurrentUser(
            @RequestHeader("Authorization") String authorizationHeader) {
        Long userId = extractUserIdFromHeader(authorizationHeader);
        return hoursService.getHoursByUser(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Shift> logWorkHours(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody Map<String, String> requestBody) {
        try {
            Long userId = extractUserIdFromHeader(authorizationHeader);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
            LocalDateTime shiftStart = LocalDateTime.parse(requestBody.get("shiftStart"), formatter);
            LocalDateTime shiftEnd = LocalDateTime.parse(requestBody.get("shiftEnd"), formatter);

            Optional<Shift> loggedHours = hoursService.createShift(userId, shiftStart, shiftEnd);

            return loggedHours.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShift(@PathVariable Long id) {
        return hoursService.deleteShift(id) ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    private Long extractUserIdFromHeader(String authorizationHeader) {
        String token = authorizationHeader.split(" ")[1];
        return authService.getUserIdFromToken(token);
    }

    @GetMapping("/user/{year}/{month}")
    public ResponseEntity<List<Shift>> getHoursForSpecificMonth(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable int year,
            @PathVariable int month) {
        Long userId = extractUserIdFromHeader(authorizationHeader);
        return hoursService.getShiftsByUserAndMonth(userId, year, month)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
