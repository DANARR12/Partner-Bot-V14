#!/bin/bash

# Xbox News Bot Runner Script
echo "🎮 Starting Xbox News Bot..."

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Kill any existing Xbox bot processes
pkill -f "xbox_news_bot.py" 2>/dev/null

# Start the Xbox news bot in the background
nohup python3 /workspace/xbox_news_bot.py > /workspace/xbox_bot.log 2>&1 &

# Get the process ID
PID=$!

echo "✅ Xbox News Bot started with PID: $PID"
echo "📄 Log file: /workspace/xbox_bot.log"
echo ""
echo "🛑 To stop the Xbox bot, run:"
echo "pkill -f 'xbox_news_bot.py'"
echo ""
echo "📊 To check if it's running:"
echo "ps aux | grep xbox_news_bot.py | grep -v grep"
echo ""
echo "📋 Commands available:"
echo "  !setup #channel    - Set news posting channel (admin only)"
echo "  !latest [count]    - Show latest Xbox news (default 3, max 5)"
echo "  !info              - Show bot information"
echo "  !remove_channel    - Remove news channel (admin only)"