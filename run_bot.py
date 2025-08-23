#!/usr/bin/env python3
"""
Simple startup script for the Discord AI Assistant Bot
"""

import os
import sys
from dotenv import load_dotenv

def check_environment():
    """Check if required environment variables are set"""
    load_dotenv()
    
    required_vars = ['DISCORD_TOKEN', 'OPENAI_API_KEY']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease create a .env file with your credentials.")
        print("See .env.example for reference.")
        return False
    
    print("✅ Environment variables loaded successfully")
    return True

def main():
    """Main startup function"""
    print("🚀 Starting Discord AI Assistant Bot...")
    
    if not check_environment():
        sys.exit(1)
    
    try:
        # Import and run the bot
        from discord_bot import client, DISCORD_TOKEN
        print("🤖 Bot imported successfully")
        print("📡 Connecting to Discord...")
        client.run(DISCORD_TOKEN)
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Please install dependencies with: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting bot: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()