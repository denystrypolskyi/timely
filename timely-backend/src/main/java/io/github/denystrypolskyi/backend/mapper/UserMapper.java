package io.github.denystrypolskyi.backend.mapper;

import io.github.denystrypolskyi.backend.dto.UserResponse;
import io.github.denystrypolskyi.backend.model.UserEntity;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponse toDTO(UserEntity user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getFullName(), user.getRole(), user.getCreatedAt(), user.getUpdatedAt());
    }
}
