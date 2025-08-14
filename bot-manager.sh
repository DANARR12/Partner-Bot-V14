#!/bin/bash

# Discord Bot Manager Script
# Usage: ./bot-manager.sh [command]

case "$1" in
    start)
        echo "🚀 Starting Discord Bot forever..."
        npm run start:forever
        ;;
    stop)
        echo "🛑 Stopping Discord Bot..."
        npm run stop
        ;;
    restart)
        echo "🔄 Restarting Discord Bot..."
        npm run restart
        ;;
    status)
        echo "📊 Discord Bot Status:"
        npm run status
        ;;
    logs)
        echo "📝 Discord Bot Logs:"
        npm run logs
        ;;
    monitor)
        echo "🖥️  Opening PM2 Monitor..."
        npm run monitor
        ;;
    dashboard)
        echo "🌐 Dashboard URL: http://localhost:3000"
        echo "📊 API Status: http://localhost:3000/api/status"
        ;;
    test)
        echo "🧪 Testing bot connectivity..."
        curl -s http://localhost:3000/api/status | jq . 2>/dev/null || curl -s http://localhost:3000/api/status
        ;;
    *)
        echo "Discord Bot Manager"
        echo "==================="
        echo "Usage: $0 {start|stop|restart|status|logs|monitor|dashboard|test}"
        echo ""
        echo "Commands:"
        echo "  start     - Start the bot forever (with auto-restart)"
        echo "  stop      - Stop the bot"
        echo "  restart   - Restart the bot"
        echo "  status    - Show bot status"
        echo "  logs      - Show bot logs"
        echo "  monitor   - Open PM2 monitor"
        echo "  dashboard - Show dashboard URLs"
        echo "  test      - Test bot connectivity"
        ;;
esac