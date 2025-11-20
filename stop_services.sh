#!/bin/bash

echo "🛑 Stopping NexaModel services..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Stop services using PID files
if [ -f logs/spring-boot.pid ]; then
    SPRING_PID=$(cat logs/spring-boot.pid)
    if ps -p $SPRING_PID > /dev/null; then
        print_status "Stopping Spring Boot service (PID: $SPRING_PID)..."
        kill $SPRING_PID
        rm logs/spring-boot.pid
        print_success "Spring Boot service stopped"
    else
        print_status "Spring Boot service not running"
        rm -f logs/spring-boot.pid
    fi
fi

if [ -f logs/ml-service.pid ]; then
    ML_PID=$(cat logs/ml-service.pid)
    if ps -p $ML_PID > /dev/null; then
        print_status "Stopping ML service (PID: $ML_PID)..."
        kill $ML_PID
        rm logs/ml-service.pid
        print_success "ML service stopped"
    else
        print_status "ML service not running"
        rm -f logs/ml-service.pid
    fi
fi

if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null; then
        print_status "Stopping Frontend service (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        rm logs/frontend.pid
        print_success "Frontend service stopped"
    else
        print_status "Frontend service not running"
        rm -f logs/frontend.pid
    fi
fi

# Kill any remaining processes on the ports (fallback)
print_status "Checking for remaining processes on ports..."

# Check port 8080 (Spring Boot)
PORT_8080_PID=$(lsof -ti:8080 2>/dev/null)
if [ ! -z "$PORT_8080_PID" ]; then
    print_status "Killing process on port 8080..."
    kill -9 $PORT_8080_PID 2>/dev/null
fi

# Check port 8001 (ML Service)
PORT_8001_PID=$(lsof -ti:8001 2>/dev/null)
if [ ! -z "$PORT_8001_PID" ]; then
    print_status "Killing process on port 8001..."
    kill -9 $PORT_8001_PID 2>/dev/null
fi

# Check port 3000 (Frontend)
PORT_3000_PID=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$PORT_3000_PID" ]; then
    print_status "Killing process on port 3000..."
    kill -9 $PORT_3000_PID 2>/dev/null
fi

print_success "All services stopped!"
