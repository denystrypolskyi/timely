# Use an official OpenJDK runtime as a base image
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the JAR file to the container
# The `target/demo-0.0.1-SNAPSHOT.jar` path depends on your Maven artifact ID and version
COPY target/demo-0.0.1-SNAPSHOT.jar app.jar

# Expose the port your Spring Boot app runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
