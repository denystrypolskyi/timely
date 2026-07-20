package io.github.denystrypolskyi.bot;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public class AddShiftHandler {

    private static final Duration CONFIRMATION_TTL = Duration.ofMinutes(10);
    private static final String CONFIRM_PREFIX = "add:confirm:";
    private static final String CANCEL_PREFIX = "add:cancel:";

    private final BackendClient backend;
    private final TelegramMessenger telegram;
    private final Clock clock;
    private final ZoneId timeZone;
    private final ConcurrentMap<Long, PendingAdd> pendingAdds = new ConcurrentHashMap<>();

    public AddShiftHandler(
            BackendClient backend,
            TelegramMessenger telegram,
            Clock clock,
            ZoneId timeZone
    ) {
        this.backend = backend;
        this.telegram = telegram;
        this.clock = clock;
        this.timeZone = timeZone;
    }

    public void request(Long chatId, Long userId, String messageText) {
        AddShiftDraft draft;
        try {
            draft = AddShiftCommand.parse(messageText, clock, timeZone);
        } catch (DateTimeParseException exception) {
            telegram.send(
                    chatId,
                    "⚠️ Invalid shift\n\nUse /add HH:mm HH:mm\nor /add YYYY-MM-DD HH:mm HH:mm\n\nExample: /add 2026-07-21 08:00 16:30"
            );
            return;
        }

        // The nonce makes buttons from older confirmation messages harmless.
        String nonce = UUID.randomUUID().toString();
        telegram.sendConfirmation(
                chatId,
                AddShiftCommand.formatConfirmation(draft),
                CONFIRM_PREFIX + nonce,
                CANCEL_PREFIX + nonce
        );
        pendingAdds.put(userId, new PendingAdd(
                nonce,
                draft,
                clock.instant().plus(CONFIRMATION_TTL)
        ));
    }

    public void handleCallback(
            String callbackId,
            Long chatId,
            Long userId,
            String data
    ) {
        boolean confirm = data != null && data.startsWith(CONFIRM_PREFIX);
        boolean cancel = data != null && data.startsWith(CANCEL_PREFIX);
        if (!confirm && !cancel) {
            telegram.answerCallback(callbackId, "❓ Action not supported.", false);
            return;
        }

        String prefix = confirm ? CONFIRM_PREFIX : CANCEL_PREFIX;
        PendingAdd pending = claimPendingAdd(userId, data.substring(prefix.length()));
        if (pending == null) {
            telegram.answerCallback(
                    callbackId,
                    "⌛ Confirmation expired or already used.",
                    true
            );
            return;
        }

        if (cancel) {
            telegram.answerCallback(callbackId, "✕ Cancelled", false);
            if (chatId != null) {
                telegram.send(chatId, "✕ Shift addition cancelled.");
            }
            return;
        }

        telegram.answerCallback(callbackId, "Adding…", false);
        if (chatId == null) {
            return;
        }

        createShift(chatId, pending.draft());
    }

    public boolean supportsCallback(String data) {
        return data != null
                && (data.startsWith(CONFIRM_PREFIX) || data.startsWith(CANCEL_PREFIX));
    }

    private PendingAdd claimPendingAdd(Long userId, String nonce) {
        PendingAdd pending = pendingAdds.get(userId);
        if (pending == null
                || !pending.nonce().equals(nonce)
                || !clock.instant().isBefore(pending.expiresAt())) {
            if (pending != null && !clock.instant().isBefore(pending.expiresAt())) {
                pendingAdds.remove(userId, pending);
            }
            return null;
        }

        return pendingAdds.remove(userId, pending) ? pending : null;
    }

    private void createShift(Long chatId, AddShiftDraft draft) {
        try {
            backend.createShift(draft.start(), draft.end());
            telegram.send(chatId, AddShiftCommand.formatCreated(draft));
        } catch (BackendException exception) {
            System.err.println("Backend API error: " + exception.getMessage());

            if (exception.statusCode() != null && exception.statusCode() == 401) {
                telegram.send(chatId, "🔒 The backend rejected the configured username or password.");
            } else if (exception.statusCode() != null && exception.statusCode() == 400) {
                telegram.send(chatId, "⚠️ The backend rejected this shift.\n\nCheck the times and possible overlaps.");
            } else {
                telegram.send(chatId, "⚠️ Could not add the shift.\n\nCheck the backend and try again.");
            }
        }
    }

    private record PendingAdd(String nonce, AddShiftDraft draft, Instant expiresAt) {
    }
}
