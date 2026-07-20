package io.github.denystrypolskyi.backend.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotNull;

public record UpdateShiftRequest(
        @NotNull Instant shiftStart,
        @NotNull Instant shiftEnd
) {}