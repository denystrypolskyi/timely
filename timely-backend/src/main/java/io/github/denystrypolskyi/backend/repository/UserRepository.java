package io.github.denystrypolskyi.backend.repository;

import io.github.denystrypolskyi.backend.model.UserEntity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    UserEntity findByUsername(String username);
    UserEntity findByEmail(String email);
    Boolean existsByUsername(String username);
}
