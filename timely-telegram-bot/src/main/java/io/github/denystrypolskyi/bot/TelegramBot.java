package io.github.denystrypolskyi.bot;

import org.telegram.telegrambots.longpolling.util.LongPollingSingleThreadUpdateConsumer;
import org.telegram.telegrambots.meta.api.objects.Update;

import java.time.Clock;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;

public class TelegramBot implements LongPollingSingleThreadUpdateConsumer {

    private final BotConfig config;
    private final BackendClient backend;
    private final TelegramMessenger telegram;
    private final AddShiftHandler addShiftHandler;
    private final RemoveShiftHandler removeShiftHandler;
    private final Clock clock;

    public TelegramBot(BotConfig config, BackendClient backend) {
        this.config = config;
        this.backend = backend;
        this.telegram = new TelegramMessenger(config.telegramBotToken());
        this.clock = Clock.system(config.timeZone());
        this.addShiftHandler = new AddShiftHandler(
                backend,
                telegram,
                clock,
                config.timeZone()
        );
        this.removeShiftHandler = new RemoveShiftHandler(
                backend,
                telegram,
                clock,
                config.timeZone()
        );
    }

    @Override
    public void consume(Update update) {
        if (update.hasCallbackQuery()) {
            handleCallback(update);
        } else if (update.hasMessage() && update.getMessage().hasText()) {
            handleMessage(update);
        }
    }

    private void handleMessage(Update update) {
        var message = update.getMessage();
        if (message.getFrom() == null) {
            return;
        }

        Long chatId = message.getChatId();
        Long userId = message.getFrom().getId();
        String command = commandFrom(message.getText());

        if ("/whoami".equals(command)) {
            telegram.send(chatId, "🆔 Your Telegram ID\n\n" + userId);
            return;
        }
        if (!isOwner(userId)) {
            sendAccessDenied(chatId);
            return;
        }

        switch (command) {
            case "/start" -> telegram.send(chatId, "⏱️ " + config.displayName()
                    + "\n\nTrack your work, one shift at a time.\nSend /help to get started.");
            case "/help" -> sendHelp(chatId);
            case "/profile" -> sendProfile(chatId);
            case "/today" -> sendToday(chatId);
            case "/month" -> sendMonth(chatId, message.getText());
            case "/add" -> {
                if (hasBackendCredentials(chatId)) {
                    addShiftHandler.request(chatId, userId, message.getText());
                }
            }
            case "/remove" -> {
                if (hasBackendCredentials(chatId)) {
                    removeShiftHandler.request(chatId, userId, message.getText());
                }
            }
            default -> telegram.send(chatId, "❓ Unknown command\n\nSend /help to see what I can do.");
        }
    }

    private void handleCallback(Update update) {
        var callback = update.getCallbackQuery();
        if (callback.getFrom() == null) {
            return;
        }
        if (!isOwner(callback.getFrom().getId())) {
            telegram.answerCallback(callback.getId(), "🔒 This bot is private.", true);
            return;
        }

        Long chatId = callback.getMessage() == null
                ? null
                : callback.getMessage().getChatId();
        String data = callback.getData();
        if (addShiftHandler.supportsCallback(data)) {
            addShiftHandler.handleCallback(callback.getId(), chatId, callback.getFrom().getId(), data);
        } else if (removeShiftHandler.supportsCallback(data)) {
            removeShiftHandler.handleCallback(callback.getId(), chatId, callback.getFrom().getId(), data);
        } else {
            telegram.answerCallback(callback.getId(), "❓ Action not supported.", false);
        }
    }

    private boolean isOwner(Long userId) {
        return config.hasAllowedUser() && config.allowedTelegramUserId().equals(userId);
    }

    private void sendAccessDenied(Long chatId) {
        if (config.hasAllowedUser()) {
            telegram.send(chatId, "🔒 This bot is private.");
        } else {
            telegram.send(
                    chatId,
                    "⚠️ Owner access is not configured.\n\nSend /whoami, add the ID to TELEGRAM_ALLOWED_USER_ID, then restart the bot."
            );
        }
    }

    private void sendHelp(Long chatId) {
        telegram.send(chatId, """
                ⏱️ Commands

                📊 Reports
                /today — Today
                /month — This month
                /month 2026-07 — Another month

                ✏️ Shifts
                /add 08:00 16:30 — Add today
                /add 2026-07-21 08:00 16:30 — Add another date
                /remove 42 — Remove by ID

                👤 Account
                /profile — Your profile
                /whoami — Your Telegram ID
                """);
    }

    private void sendProfile(Long chatId) {
        if (!hasBackendCredentials(chatId)) {
            return;
        }

        try {
            UserProfile profile = backend.getProfile();
            telegram.send(chatId, formatProfile(profile));
        } catch (BackendException exception) {
            sendApiError(chatId, exception, "profile");
        }
    }

    private void sendToday(Long chatId) {
        if (!hasBackendCredentials(chatId)) {
            return;
        }

        LocalDate today = LocalDate.now(clock);
        try {
            List<Shift> shifts = backend.getShifts(YearMonth.from(today));
            telegram.send(chatId, TodayReport.format(today, shifts, config.timeZone()));
        } catch (BackendException exception) {
            sendApiError(chatId, exception, "shifts for today");
        }
    }

    private void sendMonth(Long chatId, String text) {
        if (!hasBackendCredentials(chatId)) {
            return;
        }

        try {
            YearMonth month = MonthReport.parseRequestedMonth(text, clock, config.timeZone());
            List<Shift> shifts = backend.getShifts(month);
            telegram.send(chatId, MonthReport.format(month, shifts, config.timeZone()));
        } catch (DateTimeParseException exception) {
            telegram.send(chatId, "⚠️ Invalid month\n\nUse /month or /month YYYY-MM\nExample: /month 2026-07");
        } catch (BackendException exception) {
            sendApiError(chatId, exception, "monthly shifts");
        }
    }

    private boolean hasBackendCredentials(Long chatId) {
        if (config.hasBackendCredentials()) {
            return true;
        }
        telegram.send(
                chatId,
                "⚠️ Backend login is not configured.\n\nAdd BACKEND_USERNAME and BACKEND_PASSWORD, then restart the bot."
        );
        return false;
    }

    private void sendApiError(Long chatId, BackendException exception, String resource) {
        System.err.println("Backend API error: " + exception.getMessage());
        if (exception.statusCode() != null && exception.statusCode() == 401) {
            telegram.send(chatId, "🔒 The backend rejected the configured username or password.");
        } else {
            telegram.send(chatId, "⚠️ Could not load " + resource + ".\n\nCheck the backend and try again.");
        }
    }

    private static String formatProfile(UserProfile profile) {
        StringBuilder text = new StringBuilder("👤 Profile\n");
        addLine(text, "Username", profile.username());
        addLine(text, "Name", profile.fullName());
        addLine(text, "Email", profile.email());
        addLine(text, "Role", profile.role());
        return text.toString();
    }

    private static void addLine(StringBuilder text, String label, String value) {
        if (value != null && !value.isBlank()) {
            text.append('\n').append(label).append(" · ").append(value);
        }
    }

    private static String commandFrom(String text) {
        String command = text.trim().split("\\s+", 2)[0].toLowerCase(Locale.ROOT);
        int atSign = command.indexOf('@');
        return atSign < 0 ? command : command.substring(0, atSign);
    }
}
