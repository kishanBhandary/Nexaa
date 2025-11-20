#!/bin/bash

echo "📊 NexaModel Services Status"
echo "=========================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_service() {
    local service_name=$1
    local url=$2
    local port=$3
    
    if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name${NC} - Running on port $port"
    else
        echo -e "${RED}❌ $service_name${NC} - Not responding on port $port"
    fi
}

# Check services
check_service "Spring Boot Auth" "http://localhost:8080/auth/health" "8080"
check_service "FastAPI ML Service" "http://localhost:8001/health" "8001"
check_service "React Frontend" "http://localhost:3000" "3000"

echo ""
echo "🌐 Access URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Auth API: http://localhost:8080"
echo "  ML API: http://localhost:8001"
