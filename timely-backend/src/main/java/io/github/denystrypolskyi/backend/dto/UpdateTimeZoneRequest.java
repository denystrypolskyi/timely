package io.github.denystrypolskyi.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateTimeZoneRequest(
        @NotBlank(message = "Time zone must be provided") String timeZone
) {
}
