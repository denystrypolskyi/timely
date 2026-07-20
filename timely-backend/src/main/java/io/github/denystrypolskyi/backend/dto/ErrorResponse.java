package io.github.denystrypolskyi.backend.dto;

import java.time.LocalDateTime;

public record ErrorResponse(
        String message, String detailedMessage, LocalDateTime timestamp
        ) {
}
