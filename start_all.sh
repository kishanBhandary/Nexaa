#!/bin/bash

# NexaModel Complete Setup Script
# This script sets up and starts all services for the integrated 

echo "🚀 Starting NexaModel Integration Setup..."
echo "========================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Java
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
        print_success "Java found: $JAVA_VERSION"
    else
        print_error "Java not found. Please install Java 17 or higher."
        exit 1
    fi
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js 18 or higher."
        exit 1
    fi
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        print_success "Python found: $PYTHON_VERSION"
    else
        print_error "Python3 not found. Please install Python 3.8 or higher."
        exit 1
    fi
    
    # Check Maven (optional, will use wrapper if not found)
    if command -v mvn &> /dev/null; then
        MVN_VERSION=$(mvn --version | head -n 1)
        print_success "Maven found: $MVN_VERSION"
    else
        print_warning "Maven not found. Will use Maven wrapper."
    fi
}

# Setup ML Service
setup_ml_service() {
    print_status "Setting up ML Service..."
    
    cd ml-service
    
    # Make setup script executable
    chmod +x setup.sh
    
    # Run setup
    if ./setup.sh; then
        print_success "ML Service setup completed"
    else
        print_error "ML Service setup failed"
        return 1
    fi
    
    cd ..
}

# Setup Frontend
setup_frontend() {
    print_status "Setting up Frontend..."
    
    cd frontend
    
    # Install dependencies
    if npm install; then
        print_success "Frontend dependencies installed"
    else
        print_error "Frontend setup failed"
        return 1
    fi
    
    cd ..
}

# Start services in background
start_services() {
    print_status "Starting services..."
    
    # Create logs directory
    mkdir -p logs
    
    # Start Spring Boot service
    print_status "Starting Spring Boot Auth Service..."
    cd backend
    if command -v mvn &> /dev/null; then
        nohup mvn spring-boot:run > ../logs/spring-boot.log 2>&1 &
    else
        nohup ./mvnw spring-boot:run > ../logs/spring-boot.log 2>&1 &
    fi
    SPRING_PID=$!
    echo $SPRING_PID > ../logs/spring-boot.pid
    cd ..
    
    # Wait for Spring Boot to start
    print_status "Waiting for Spring Boot to start..."
    for i in {1..30}; do
        if curl -s http://localhost:8080/auth/health > /dev/null 2>&1; then
            print_success "Spring Boot started successfully"
            break
        fi
        sleep 2
        if [ $i -eq 30 ]; then
            print_error "Spring Boot failed to start within 60 seconds"
            return 1
        fi
    done
    
    # Start ML Service
    print_status "Starting FastAPI ML Service..."
    cd ml-service
    source venv/bin/activate
    
    # Install ML dependencies if not present
    pip install -q tf-keras gtts aiofiles transformers torch opencv-python librosa
    
    # Kill any existing ML service
    pkill -f "simple_main.py" 2>/dev/null || true
    
    nohup python simple_main.py > ../logs/ml-service.log 2>&1 &
    ML_PID=$!
    echo $ML_PID > ../logs/ml-service.pid
    deactivate
    cd ..
    
    # Wait for ML Service to start
    print_status "Waiting for ML Service to start..."
    for i in {1..20}; do
        if curl -s http://localhost:8001/health > /dev/null 2>&1; then
            print_success "ML Service started successfully"
            break
        fi
        sleep 2
        if [ $i -eq 20 ]; then
            print_warning "ML Service may have issues, but continuing..."
            break
        fi
    done
    
    # Start Frontend
    print_status "Starting React Frontend..."
    cd frontend
    nohup npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../logs/frontend.pid
    cd ..
    
    # Wait for Frontend to start
    print_status "Waiting for Frontend to start..."
    sleep 5
    
    print_success "All services started!"
    print_status "Service URLs:"
    echo "  🌐 Frontend: http://localhost:3000"
    echo "  🔐 Auth API: http://localhost:8080"
    echo "  🧠 ML API: http://localhost:8001"
    echo ""
    print_status "Log files:"
    echo "  📋 Spring Boot: logs/spring-boot.log"
    echo "  📋 ML Service: logs/ml-service.log"
    echo "  📋 Frontend: logs/frontend.log"
    echo ""
    print_status "To stop services, run: ./stop_services.sh"
}

# Create stop script
create_stop_script() {
    cat > stop_services.sh << 'EOF'
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
EOF

    chmod +x stop_services.sh
}

# Create status check script
create_status_script() {
    cat > check_status.sh << 'EOF'
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
EOF

    chmod +x check_status.sh
}

# Main execution
main() {
    # Parse command line arguments
    SKIP_SETUP=false
    START_SERVICES=true
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-setup)
                SKIP_SETUP=true
                shift
                ;;
            --setup-only)
                START_SERVICES=false
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --skip-setup    Skip setup and only start services"
                echo "  --setup-only    Only run setup, don't start services"
                echo "  --help          Show this help message"
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Run setup if not skipped
    if [ "$SKIP_SETUP" = false ]; then
        check_prerequisites
        
        if ! setup_ml_service; then
            print_error "Failed to setup ML service"
            exit 1
        fi
        
        if ! setup_frontend; then
            print_error "Failed to setup frontend"
            exit 1
        fi
        
        print_success "Setup completed successfully!"
    fi
    
    # Start services if requested
    if [ "$START_SERVICES" = true ]; then
        create_stop_script
        create_status_script
        
        if start_services; then
            echo ""
            echo "🎉 NexaModel integration is ready!"
            echo "Open http://localhost:3000 in your browser to get started."
        else
            print_error "Failed to start services"
            exit 1
        fi
    fi
}

# Run main function with all arguments
main "$@"
