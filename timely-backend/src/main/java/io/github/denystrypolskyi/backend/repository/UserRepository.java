package io.github.denystrypolskyi.backend.repository;

import io.github.denystrypolskyi.backend.model.UserEntity;
import io.github.denystrypolskyi.backend.model.OAuthProvider;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    UserEntity findByUsername(String username);
    UserEntity findByEmail(String email);
    UserEntity findByOauthProviderAndOauthSubject(OAuthProvider provider, String subject);
    Boolean existsByUsername(String username);
}
