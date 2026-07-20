FROM maven:3.9.16-eclipse-temurin-17 AS build

WORKDIR /build

COPY pom.xml .
RUN mvn --batch-mode dependency:go-offline

COPY src ./src
RUN mvn --batch-mode clean package

FROM eclipse-temurin:17-jre

WORKDIR /app

RUN groupadd --system appuser \
    && useradd --system --gid appuser --no-create-home appuser

COPY --from=build --chown=appuser:appuser \
    /build/target/telegram-bot-1.0-SNAPSHOT.jar \
    /app/telegram-bot.jar

USER appuser

ENTRYPOINT ["java", "-jar", "/app/telegram-bot.jar"]
