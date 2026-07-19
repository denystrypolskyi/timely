package com.example.demo.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotNull;

public record UpdateShiftRequest(
        @NotNull Instant shiftStart,
        @NotNull Instant shiftEnd
) {}