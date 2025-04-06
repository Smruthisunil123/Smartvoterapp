# Use Java 17 base image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy the JAR file
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start the app
ENTRYPOINT ["java", "-jar", "app.jar"]
