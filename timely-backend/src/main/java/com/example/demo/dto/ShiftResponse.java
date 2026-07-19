package com.example.demo.dto;

import java.time.Instant;

public record ShiftResponse(Long id, Long shiftDurationMinutes, Instant shiftStart, Instant shiftEnd, Long userId) {
}
