#!/bin/bash

# NexaModel System Status Checker
# This script checks the status of all services in the Nexaa application

echo "🔍 Checking NexaModel System Status..."
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

check_service() {
    local service_name=$1
    local url=$2
    local port=$3
    
    # Check if port is listening
    if netstat -tlnp 2>/dev/null | grep ":$port " | grep LISTEN > /dev/null; then
        # Try to connect to the service
        if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name${NC} - Running on port $port"
            return 0
        else
            echo -e "${YELLOW}⚠️  $service_name${NC} - Port $port open but service not responding"
            return 1
        fi
    else
        echo -e "${RED}❌ $service_name${NC} - Not running on port $port"
        return 1
    fi
}

check_ml_functionality() {
    echo ""
    echo -e "${BLUE}🧠 Testing ML Service Functionality...${NC}"
    
    local response=$(curl -s -X POST "http://localhost:8001/analyze/text" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer demo-token-123" \
        -d '{"text": "I am feeling great today!"}' 2>/dev/null)
    
    if echo "$response" | grep -q "predicted_emotion"; then
        local emotion=$(echo "$response" | grep -o '"predicted_emotion":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✅ ML Analysis Working${NC} - Detected emotion: $emotion"
    else
        echo -e "${RED}❌ ML Analysis Failed${NC} - Response: $response"
    fi
}

# Check services
echo ""
check_service "Spring Boot Backend" "http://localhost:8080" "8080"
ml_status=$?
check_service "FastAPI ML Service" "http://localhost:8001/health" "8001"
backend_status=$?
check_service "React Frontend" "http://localhost:5173" "5173"
frontend_status=$?

# Test ML functionality if ML service is running
if [ $ml_status -eq 0 ]; then
    check_ml_functionality
fi

echo ""
echo "🌐 Access URLs:"
echo "  Frontend: http://localhost:5173"
echo "  Backend API: http://localhost:8080" 
echo "  ML API: http://localhost:8001"
echo "  ML API Docs: http://localhost:8001/docs"

echo ""
if [ $ml_status -eq 0 ] && [ $backend_status -eq 0 ] && [ $frontend_status -eq 0 ]; then
    echo -e "${GREEN}🎉 All systems operational!${NC}"
else
    echo -e "${YELLOW}⚠️  Some services need attention.${NC}"
    echo ""
    echo "To start missing services:"
    [ $ml_status -ne 0 ] && echo "  ML Service: ./start_ml_service.sh"
    [ $backend_status -ne 0 ] && echo "  Backend: cd backend && mvn spring-boot:run"
    [ $frontend_status -ne 0 ] && echo "  Frontend: cd frontend && npm run dev"
fi