package io.github.denystrypolskyi.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateUsernameRequest(@NotBlank String username) {
}