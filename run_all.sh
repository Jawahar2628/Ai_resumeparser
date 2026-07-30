#!/bin/bash

# Function to stop all background processes on exit
cleanup() {
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap SIGINT and SIGTERM signals
trap cleanup SIGINT SIGTERM

echo "==========================================="
echo "Starting AI Resume Parser System"
echo "==========================================="

# Start AI Parser (Port 8001 as expected by server-backend)
echo "[1/3] Starting AI Parser on port 8001..."
cd ai-parser
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8001 &
cd ..

# Start Server Backend (Port 8000 as expected by UI)
echo "[2/3] Starting Server Backend on port 8000..."
cd server-backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
cd ..

# Start UI
echo "[3/3] Starting UI Dashboard..."
npm run dev &

echo "==========================================="
echo "All services started! Press Ctrl+C to stop."
echo "UI is running (check output above for the link)."
echo "Backend API is at http://localhost:8000"
echo "AI Parser is at http://localhost:8001"
echo "==========================================="

# Wait for background jobs to keep the script running
wait
