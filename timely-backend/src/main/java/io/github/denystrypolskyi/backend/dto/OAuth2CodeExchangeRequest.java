package io.github.denystrypolskyi.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OAuth2CodeExchangeRequest(
        @NotBlank @Size(max = 128) String code
) {
}
