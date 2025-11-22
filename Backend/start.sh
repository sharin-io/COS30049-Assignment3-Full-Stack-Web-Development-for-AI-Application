#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Air Quality Backend Services...${NC}\n"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.8 or higher.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 14 or higher.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm.${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
NODE_VERSION=$(node --version)

echo -e "${GREEN}✅ Python version: $PYTHON_VERSION${NC}"
echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}\n"

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${YELLOW}🔌 Activating Python virtual environment...${NC}"
source venv/bin/activate

# Install Python dependencies
echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install Python dependencies${NC}"
    exit 1
fi

# Check if node_modules exists, install if not
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
    npm install
else
    echo -e "${YELLOW}📦 Node.js dependencies already installed${NC}"
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install Node.js dependencies${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ All dependencies installed!${NC}\n"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    kill $PYTHON_PID $NODE_PID 2>/dev/null
    deactivate 2>/dev/null
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup SIGINT SIGTERM

# Start Python FastAPI server
echo -e "${GREEN}🐍 Starting Python FastAPI server on port 8000...${NC}"
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload > /tmp/python_server.log 2>&1 &
PYTHON_PID=$!

# Wait for Python server to start and check if it's actually running
echo -e "${YELLOW}⏳ Waiting for Python server to start...${NC}"
MAX_WAIT=10
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Python FastAPI server is ready!${NC}"
        break
    fi
    if ! kill -0 $PYTHON_PID 2>/dev/null; then
        echo -e "${RED}❌ Python FastAPI server failed to start${NC}"
        echo -e "${YELLOW}Last few lines of error log:${NC}"
        tail -20 /tmp/python_server.log
        exit 1
    fi
    sleep 1
    WAITED=$((WAITED + 1))
done

if [ $WAITED -eq $MAX_WAIT ]; then
    echo -e "${RED}❌ Python FastAPI server took too long to start${NC}"
    echo -e "${YELLOW}Last few lines of log:${NC}"
    tail -20 /tmp/python_server.log
    kill $PYTHON_PID 2>/dev/null
    exit 1
fi

# Start Node.js server
echo -e "${GREEN}📦 Starting Node.js Express server on port 3001...${NC}"
node server.js > /tmp/node_server.log 2>&1 &
NODE_PID=$!

# Wait for Node server to start
echo -e "${YELLOW}⏳ Waiting for Node.js server to start...${NC}"
sleep 2

# Check if Node server started successfully
if ! kill -0 $NODE_PID 2>/dev/null; then
    echo -e "${RED}❌ Failed to start Node.js server${NC}"
    echo -e "${YELLOW}Last few lines of error log:${NC}"
    tail -20 /tmp/node_server.log
    kill $PYTHON_PID 2>/dev/null
    exit 1
fi

# Verify Node server is responding
if ! curl -s http://localhost:3001/api/regions > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Node.js server started but not responding yet (this is normal, may take a moment)${NC}"
fi

echo -e "\n${GREEN}✅ Backend services started successfully!${NC}\n"
echo -e "${GREEN}📍 Services running:${NC}"
echo -e "   ${GREEN}🐍 Python FastAPI:${NC} http://localhost:8000"
echo -e "   ${GREEN}📦 Node.js API:${NC} http://localhost:3001"
echo -e "   ${GREEN}📚 API Docs:${NC} http://localhost:8000/docs\n"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}\n"

# Wait for both processes
wait

