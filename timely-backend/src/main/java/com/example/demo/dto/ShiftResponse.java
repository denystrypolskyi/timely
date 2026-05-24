package com.example.demo.dto;

import java.time.Instant;
import java.time.LocalDateTime;

public record ShiftResponse(Long id, Long shiftDurationMinutes, Instant shiftStart, Instant shiftEnd, Long userId) {
}
