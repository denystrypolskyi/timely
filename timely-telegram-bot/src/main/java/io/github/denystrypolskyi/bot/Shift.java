package io.github.denystrypolskyi.bot;

import java.time.Instant;

public record Shift(
        Long id,
        Long durationMinutes,
        Instant start,
        Instant end
) {
}
