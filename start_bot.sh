#!/bin/bash

# Discord Kurdish AI Bot - Start Forever Script
# This is the Python equivalent of "npm start forever"

echo "🚀 Starting Discord Kurdish AI Bot (Python)..."

# Navigate to project directory
cd /workspace

# Activate virtual environment
source venv/bin/activate

# Check if bot is already running
if pgrep -f "python.*main.py" > /dev/null; then
    echo "⚠️  Bot is already running. Stopping existing instance..."
    pkill -f "python.*main.py"
    sleep 2
fi

# Start bot in background with nohup (runs forever)
echo "🔄 Starting bot in background..."
nohup python main.py > bot.log 2>&1 &

# Get the process ID
BOT_PID=$!
echo "✅ Discord Kurdish AI Bot started successfully!"
echo "📋 Process ID: $BOT_PID"
echo "📄 Logs: bot.log"
echo ""
echo "🎯 Bot Features Active:"
echo "   - Sorani Kurdish AI responses"
echo "   - Voice support (TTS/STT)"
echo "   - Memory persistence"
echo "   - Translation buttons"
echo ""
echo "📋 Commands:"
echo "   /chat - AI chat in Sorani"
echo "   !talk - AI + voice response"
echo "   !join/!leave - voice control"
echo ""
echo "🛑 To stop: pkill -f 'python.*main.py'"
echo "📊 To check status: pgrep -f 'python.*main.py'"
echo "📄 To view logs: tail -f bot.log"
