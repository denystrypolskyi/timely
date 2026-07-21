package io.github.denystrypolskyi.backend.service;

import java.nio.charset.StandardCharsets;

final class PasswordPolicy {
    private static final int MIN_CHARACTERS = 12;
    private static final int MAX_BCRYPT_BYTES = 72;

    private PasswordPolicy() {
    }

    static void validate(String password) {
        if (password == null || password.length() < MIN_CHARACTERS) {
            throw new IllegalArgumentException("Password must be at least 12 characters long");
        }
        if (password.getBytes(StandardCharsets.UTF_8).length > MAX_BCRYPT_BYTES) {
            throw new IllegalArgumentException("Password must be at most 72 UTF-8 bytes");
        }
    }
}
