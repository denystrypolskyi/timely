package io.github.denystrypolskyi.bot;

import org.telegram.telegrambots.longpolling.TelegramBotsLongPollingApplication;

public class Main {

    public static void main(String[] args) throws Exception {
        BotConfig config = BotConfig.load();
        BackendClient backend = new BackendClient(
                config.backendUrl(),
                config.backendUsername(),
                config.backendPassword()
        );

        TelegramBotsLongPollingApplication application =
                new TelegramBotsLongPollingApplication();

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try {
                application.close();
            } catch (Exception exception) {
                System.err.println("Could not stop the Telegram bot cleanly: " + exception.getMessage());
            }
        }, "telegram-bot-shutdown"));

        application.registerBot(
                config.telegramBotToken(),
                new TelegramBot(config, backend)
        );

        System.out.println("Telegram bot is running");
    }
}
