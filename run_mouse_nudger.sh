#!/bin/bash

# Mouse Nudger Runner Script
# Since systemd is not available in this environment

echo "Starting mouse nudger..."

# Kill any existing mouse nudger processes
pkill -f "mouse_nudger.py" 2>/dev/null

# Start the mouse nudger in the background
nohup python3 /workspace/mouse_nudger.py > /workspace/mouse_nudger.log 2>&1 &

# Get the process ID
PID=$!

echo "Mouse nudger started with PID: $PID"
echo "Log file: /workspace/mouse_nudger.log"
echo ""
echo "To stop the mouse nudger, run:"
echo "pkill -f 'mouse_nudger.py'"
echo ""
echo "To check if it's running:"
echo "ps aux | grep mouse_nudger.py | grep -v grep"