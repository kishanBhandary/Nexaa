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
FROM openjdk:17-jre-slim

# Install necessary packages and create non-root user
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r nexaa && useradd -r -g nexaa nexaa

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

# Expose the port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/actuator/health || exit 1

# Set JVM options for containerized environment
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:G1HeapRegionSize=16m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+PrintGC -XX:+PrintGCDetails -XX:+PrintGCTimeStamps -Xloggc:/app/logs/gc.log -XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=5 -XX:GCLogFileSize=10M"

# Spring Boot specific environment variables
ENV SPRING_PROFILES_ACTIVE=docker
ENV SERVER_PORT=8080

# Run the application
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

# Alternative single-stage Dockerfile if you prefer simplicity:
# FROM openjdk:17-jre-slim
# WORKDIR /app
# COPY target/nexaa-backend-1.0.0.jar app.jar
# EXPOSE 8080
# CMD ["java", "-jar", "app.jar"]