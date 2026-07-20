package io.github.denystrypolskyi.bot;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public class RemoveShiftHandler {

    private static final Duration CONFIRMATION_TTL = Duration.ofMinutes(10);
    private static final String CONFIRM_PREFIX = "remove:confirm:";
    private static final String CANCEL_PREFIX = "remove:cancel:";

    private final BackendClient backend;
    private final TelegramMessenger telegram;
    private final Clock clock;
    private final ZoneId timeZone;
    private final ConcurrentMap<Long, PendingRemove> pendingRemovals = new ConcurrentHashMap<>();

    public RemoveShiftHandler(
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
        long shiftId;
        try {
            shiftId = RemoveShiftCommand.parseShiftId(messageText);
        } catch (IllegalArgumentException exception) {
            telegram.send(chatId, "⚠️ Invalid shift ID\n\nUse /remove ID\nExample: /remove 42");
            return;
        }

        try {
            Shift shift = backend.getAllShifts().stream()
                    .filter(candidate -> candidate.id() != null && candidate.id() == shiftId)
                    .findFirst()
                    .orElse(null);

            if (shift == null) {
                telegram.send(chatId, "🔎 Shift #" + shiftId + " was not found.");
                return;
            }

            String nonce = UUID.randomUUID().toString();
            telegram.sendConfirmation(
                    chatId,
                    RemoveShiftCommand.formatConfirmation(shift, timeZone),
                    CONFIRM_PREFIX + nonce,
                    CANCEL_PREFIX + nonce
            );
            pendingRemovals.put(userId, new PendingRemove(
                    nonce,
                    shift,
                    clock.instant().plus(CONFIRMATION_TTL)
            ));
        } catch (BackendException exception) {
            sendApiError(chatId, exception, "load the shift");
        }
    }

    public boolean supportsCallback(String data) {
        return data != null
                && (data.startsWith(CONFIRM_PREFIX) || data.startsWith(CANCEL_PREFIX));
    }

    public void handleCallback(String callbackId, Long chatId, Long userId, String data) {
        boolean confirm = data != null && data.startsWith(CONFIRM_PREFIX);
        String prefix = confirm ? CONFIRM_PREFIX : CANCEL_PREFIX;
        PendingRemove pending = claimPendingRemoval(userId, data.substring(prefix.length()));

        if (pending == null) {
            telegram.answerCallback(
                    callbackId,
                    "⌛ Confirmation expired or already used.",
                    true
            );
            return;
        }

        if (!confirm) {
            telegram.answerCallback(callbackId, "✕ Cancelled", false);
            if (chatId != null) {
                telegram.send(chatId, "✕ Shift removal cancelled.");
            }
            return;
        }

        telegram.answerCallback(callbackId, "Removing…", false);
        if (chatId != null) {
            deleteShift(chatId, pending.shift());
        }
    }

    private PendingRemove claimPendingRemoval(Long userId, String nonce) {
        PendingRemove pending = pendingRemovals.get(userId);
        if (pending == null
                || !pending.nonce().equals(nonce)
                || !clock.instant().isBefore(pending.expiresAt())) {
            if (pending != null && !clock.instant().isBefore(pending.expiresAt())) {
                pendingRemovals.remove(userId, pending);
            }
            return null;
        }

        return pendingRemovals.remove(userId, pending) ? pending : null;
    }

    private void deleteShift(Long chatId, Shift shift) {
        try {
            backend.deleteShift(shift.id());
            telegram.send(chatId, RemoveShiftCommand.formatDeleted(shift, timeZone));
        } catch (BackendException exception) {
            sendApiError(chatId, exception, "remove the shift");
        }
    }

    private void sendApiError(Long chatId, BackendException exception, String action) {
        System.err.println("Backend API error: " + exception.getMessage());
        if (exception.statusCode() != null && exception.statusCode() == 401) {
            telegram.send(chatId, "🔒 The backend rejected the configured username or password.");
        } else if (exception.statusCode() != null && exception.statusCode() == 404) {
            telegram.send(chatId, "🔎 That shift no longer exists.");
        } else {
            telegram.send(chatId, "⚠️ Could not " + action + ".\n\nCheck the backend and try again.");
        }
    }

    private record PendingRemove(String nonce, Shift shift, Instant expiresAt) {
    }
}
