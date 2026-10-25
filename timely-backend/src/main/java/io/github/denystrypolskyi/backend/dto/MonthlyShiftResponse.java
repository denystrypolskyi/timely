package io.github.denystrypolskyi.backend.dto;

import java.time.Instant;

public record MonthlyShiftResponse(
        Long id,
        Long shiftDurationMinutes,
        long durationInRequestedMonthMinutes,
        Instant shiftStart,
        Instant shiftEnd,
        Long userId
) {
}
