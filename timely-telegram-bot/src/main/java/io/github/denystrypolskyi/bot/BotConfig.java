package io.github.denystrypolskyi.bot;

import io.github.cdimascio.dotenv.Dotenv;

import java.net.URI;
import java.time.DateTimeException;
import java.time.ZoneId;

public record BotConfig(
        String displayName,
        String telegramBotToken,
        Long allowedTelegramUserId,
        URI backendUrl,
        ZoneId timeZone,
        String backendUsername,
        String backendPassword
) {

    public static BotConfig load() {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        String token = requireValue(dotenv, "TELEGRAM_BOT_TOKEN");
        Long allowedUserId = parseOptionalLong(dotenv.get("TELEGRAM_ALLOWED_USER_ID"));
        String configuredBackendUrl = dotenv.get("BACKEND_URL");
        URI backendUrl = parseBackendUrl(
                isPresent(configuredBackendUrl) ? configuredBackendUrl : "http://localhost:8080"
        );
        ZoneId timeZone = parseTimeZone(dotenv.get("BOT_TIME_ZONE"));

        return new BotConfig(
                valueOrDefault(dotenv.get("BOT_DISPLAY_NAME"), "Shift Tracker"),
                token,
                allowedUserId,
                backendUrl,
                timeZone,
                dotenv.get("BACKEND_USERNAME"),
                dotenv.get("BACKEND_PASSWORD")
        );
    }

    public boolean hasAllowedUser() {
        return allowedTelegramUserId != null;
    }

    public boolean hasBackendCredentials() {
        return isPresent(backendUsername) && isPresent(backendPassword);
    }

    private static String requireValue(Dotenv dotenv, String name) {
        String value = dotenv.get(name);
        if (!isPresent(value)) {
            throw new IllegalStateException(name + " is missing");
        }
        return value;
    }

    private static Long parseOptionalLong(String value) {
        if (!isPresent(value)) {
            return null;
        }

        try {
            return Long.parseLong(value);
        } catch (NumberFormatException exception) {
            throw new IllegalStateException("TELEGRAM_ALLOWED_USER_ID must be a number", exception);
        }
    }

    private static URI parseBackendUrl(String value) {
        try {
            String normalized = value.endsWith("/")
                    ? value.substring(0, value.length() - 1)
                    : value;
            return URI.create(normalized);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("BACKEND_URL is invalid", exception);
        }
    }

    private static ZoneId parseTimeZone(String value) {
        try {
            return ZoneId.of(isPresent(value) ? value : "Europe/Warsaw");
        } catch (DateTimeException exception) {
            throw new IllegalStateException("BOT_TIME_ZONE is invalid", exception);
        }
    }

    private static boolean isPresent(String value) {
        return value != null && !value.isBlank();
    }

    private static String valueOrDefault(String value, String defaultValue) {
        return isPresent(value) ? value : defaultValue;
    }
}
