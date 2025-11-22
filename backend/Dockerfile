# Multi-stage Dockerfile for Nexaa Backend Spring Boot Application

# Stage 1: Build stage (if source code is present)
FROM maven:3.9.6-openjdk-17 AS build
WORKDIR /app

# Copy pom.xml and download dependencies (for better caching)
# Note: If pom.xml is not present, this stage can be skipped
# COPY pom.xml .
# RUN mvn dependency:go-offline -B

# Copy source code and build
# COPY src ./src
# RUN mvn clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jre-alpine AS runtime

# Install necessary packages and create non-root user
RUN apk add --no-cache curl && \
  addgroup -S nexaa && adduser -S nexaa -G nexaa

# Set working directory
WORKDIR /app

# Copy the JAR file from target directory
# Using the pre-built JAR since source files are not available
COPY target/nexaa-backend-1.0.0.jar app.jar

# Create logs directory and set permissions
RUN mkdir -p /app/logs && \
    chown -R nexaa:nexaa /app

# Switch to non-root user
USER nexaa

# Expose the default application port (Render will inject PORT)
EXPOSE 8080

# Health check
# Health check (adjust path if your app exposes a different endpoint)
# Uses dynamic PORT provided by Render; replace /api/health with a valid endpoint.
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=5 CMD curl -f http://127.0.0.1:${PORT:-8080}/api/health || exit 1

# Set JVM options for containerized environment
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Spring Boot specific environment variables
ENV SPRING_PROFILES_ACTIVE=docker
# PORT is provided by Render automatically; Spring Boot uses server.port=${PORT:8080}

# Run the application
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

# Alternative single-stage Dockerfile if you prefer simplicity:
# FROM openjdk:17-jre-slim
# WORKDIR /app
# COPY target/nexaa-backend-1.0.0.jar app.jar
# EXPOSE 8080
# CMD ["java", "-jar", "app.jar"]