package io.github.denystrypolskyi.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateUserRequest(@NotBlank String username, @NotBlank String password) {
}
