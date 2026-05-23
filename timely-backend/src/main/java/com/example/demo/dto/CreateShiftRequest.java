package com.example.demo.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CreateShiftRequest(@NotNull @FutureOrPresent LocalDateTime shiftStart,
                                 @NotNull @FutureOrPresent LocalDateTime shiftEnd) {
}
