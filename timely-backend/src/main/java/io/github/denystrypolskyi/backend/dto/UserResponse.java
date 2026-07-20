package io.github.denystrypolskyi.backend.dto;

import io.github.denystrypolskyi.backend.model.Role;

import java.time.LocalDateTime;

public record UserResponse(Long id, String username, String email, String fullName, Role role, LocalDateTime createdAt,
                           LocalDateTime updatedAt) {

}
