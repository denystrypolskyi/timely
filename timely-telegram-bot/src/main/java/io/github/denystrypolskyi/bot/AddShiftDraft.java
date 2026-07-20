package io.github.denystrypolskyi.bot;

import java.time.Instant;
import java.time.LocalDateTime;

public record AddShiftDraft(
        LocalDateTime localStart,
        LocalDateTime localEnd,
        Instant start,
        Instant end,
        long durationMinutes
) {
}
