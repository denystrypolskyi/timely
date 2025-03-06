# Используем официальное JDK 17 как базовый образ
FROM openjdk:17-jdk-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем jar-файл приложения в контейнер
COPY target/demo-0.0.1-SNAPSHOT.jar /app/demo.jar

# Открываем порт 8080
EXPOSE 8080

# Запускаем приложение
ENTRYPOINT ["java", "-jar", "demo.jar"]
