package io.github.denystrypolskyi.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePasswordRequest(
        @NotBlank @Size(max = 72) String oldPassword,
        @NotBlank @Size(min = 12, max = 72) String newPassword
) {}
