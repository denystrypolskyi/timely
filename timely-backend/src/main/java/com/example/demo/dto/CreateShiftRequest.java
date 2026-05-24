package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record CreateShiftRequest(@NotNull Instant shiftStart,
                                 @NotNull Instant shiftEnd) {
}
