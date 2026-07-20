package io.github.denystrypolskyi.bot;

import org.telegram.telegrambots.client.okhttp.OkHttpTelegramClient;
import org.telegram.telegrambots.meta.api.methods.AnswerCallbackQuery;
import org.telegram.telegrambots.meta.api.methods.botapimethods.BotApiMethod;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardRow;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.meta.generics.TelegramClient;

public class TelegramMessenger {

    private final TelegramClient client;

    public TelegramMessenger(String botToken) {
        this.client = new OkHttpTelegramClient(botToken);
    }

    public void send(Long chatId, String text) {
        execute(SendMessage.builder()
                .chatId(chatId)
                .text(text)
                .build());
    }

    public void sendConfirmation(
            Long chatId,
            String text,
            String confirmData,
            String cancelData
    ) {
        InlineKeyboardButton confirm = InlineKeyboardButton.builder()
                .text("✅ Confirm")
                .callbackData(confirmData)
                .build();
        InlineKeyboardButton cancel = InlineKeyboardButton.builder()
                .text("✕ Cancel")
                .callbackData(cancelData)
                .build();
        InlineKeyboardMarkup keyboard = InlineKeyboardMarkup.builder()
                .keyboardRow(new InlineKeyboardRow(confirm, cancel))
                .build();

        execute(SendMessage.builder()
                .chatId(chatId)
                .text(text)
                .replyMarkup(keyboard)
                .build());
    }

    public void answerCallback(String callbackId, String text, boolean showAlert) {
        execute(AnswerCallbackQuery.builder()
                .callbackQueryId(callbackId)
                .text(text)
                .showAlert(showAlert)
                .build());
    }

    private void execute(BotApiMethod<?> method) {
        try {
            client.execute(method);
        } catch (TelegramApiException exception) {
            throw new IllegalStateException("Telegram request failed", exception);
        }
    }
}
