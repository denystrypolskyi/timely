package com.example.demo.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDateTime;

public record CreateShiftRequest(@NotNull @FutureOrPresent Instant shiftStart,
                                 @NotNull @FutureOrPresent Instant shiftEnd) {
}
