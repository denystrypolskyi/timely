package io.github.denystrypolskyi.bot;

public record UserProfile(
        Long id,
        String username,
        String email,
        String fullName,
        String role
) {
}
