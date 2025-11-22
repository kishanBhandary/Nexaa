#!/usr/bin/env bash

# Render start script for Nexaa Backend
# Starts the Spring Boot application with optimized settings for cloud deployment

echo "🚀 Starting Nexaa Backend..."
echo "Java version:"
java -version

# Set JVM options for cloud deployment
export JAVA_OPTS="${JAVA_OPTS} -Xmx512m -Xms256m"
export JAVA_OPTS="${JAVA_OPTS} -Dspring.profiles.active=prod"
export JAVA_OPTS="${JAVA_OPTS} -Djava.security.egd=file:/dev/./urandom"
export JAVA_OPTS="${JAVA_OPTS} -Dserver.port=${PORT:-8080}"

echo "JVM Options: $JAVA_OPTS"
echo "Port: ${PORT:-8080}"

# Start the application
exec java $JAVA_OPTS -jar target/nexaa-backend-1.0.0.jar