#!/bin/bash

# Discord Kurdish AI Bot - Auto-Restart Script
# Bash version for Linux/macOS

set +e  # Don't exit on error

LOG_FILE="bot_restarts.log"
MAX_RESTARTS=50
RESTART_COUNT=0
START_TIME=$(date)

echo "🤖 Discord Kurdish AI Bot - Auto-Restart Manager"
echo "📅 Started at: $START_TIME"
echo "📝 Logs will be written to: $LOG_FILE"
echo "🔄 Maximum restarts: $MAX_RESTARTS"
echo "⏹️  Press Ctrl+C to stop the bot permanently"
echo ""

# Create log file with header
{
    echo "=== Discord Kurdish AI Bot Restart Log ==="
    echo "Started at: $START_TIME"
    echo ""
} >> "$LOG_FILE"

# Trap Ctrl+C to exit gracefully
trap 'echo ""; echo "🛑 Received interrupt signal. Stopping bot manager..."; exit 0' INT

while [ $RESTART_COUNT -lt $MAX_RESTARTS ]; do
    RESTART_COUNT=$((RESTART_COUNT + 1))
    CURRENT_TIME=$(date)
    
    echo "🚀 Starting bot (Attempt #$RESTART_COUNT) at $CURRENT_TIME"
    echo "[$CURRENT_TIME] Starting bot (Attempt #$RESTART_COUNT)" >> "$LOG_FILE"
    
    # Start the bot and capture exit code
    python3 main.py
    EXIT_CODE=$?
    
    EXIT_TIME=$(date)
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo "✅ Bot exited gracefully (Exit Code: $EXIT_CODE)"
        echo "[$EXIT_TIME] Bot exited gracefully (Exit Code: $EXIT_CODE)" >> "$LOG_FILE"
        echo "🛑 Stopping auto-restart due to graceful exit"
        break
    else
        echo "❌ Bot crashed with exit code: $EXIT_CODE"
        echo "[$EXIT_TIME] Bot crashed with exit code: $EXIT_CODE" >> "$LOG_FILE"
    fi
    
    if [ $RESTART_COUNT -lt $MAX_RESTARTS ]; then
        echo "⏳ Waiting 5 seconds before restart..."
        sleep 5
    fi
done

if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
    END_TIME=$(date)
    echo "🛑 Maximum restart limit ($MAX_RESTARTS) reached. Stopping."
    echo "[$END_TIME] Maximum restart limit reached. Stopping." >> "$LOG_FILE"
fi

echo "📁 Check $LOG_FILE for detailed logs"
echo "👋 Bot manager exiting..."