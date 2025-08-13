#!/bin/bash

# Activate virtual environment and run the Discord bot
echo "Starting Discord Bot..."
echo "Make sure you have created a .env file with your bot token!"

# Activate virtual environment
source discord_bot_env/bin/activate

# Run the bot
python discord_vc_bot_simple.py