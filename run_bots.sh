#!/bin/bash

echo "🤖 Discord Bot Runner"
echo "===================="
echo ""
echo "Available bots:"
echo "1) Node.js Partner Bot (Organized)"
echo "2) Node.js Partner Bot (Legacy)"  
echo "3) Python XP Bot (Secure)"
echo "4) Python XP Bot (Original - NOT RECOMMENDED)"
echo ""

read -p "Which bot do you want to run? (1-4): " choice

case $choice in
    1)
        echo "🚀 Starting Node.js Partner Bot (Organized)..."
        npm start
        ;;
    2)
        echo "🚀 Starting Node.js Partner Bot (Legacy)..."
        npm run start:legacy
        ;;
    3)
        echo "🚀 Starting Python XP Bot (Secure)..."
        echo "⚠️  Make sure you have regenerated your Discord token!"
        source discord_bot_env/bin/activate && python discord_xp_bot_secure.py
        ;;
    4)
        echo "❌ Original Python bot is NOT RECOMMENDED due to security issues!"
        echo "   Please use option 3 instead."
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        ;;
esac