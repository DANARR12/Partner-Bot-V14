#!/usr/bin/env python3
"""
Simple Discord Bot Test with Streaming Presence
"""
import discord
from discord.ext import commands
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

intents = discord.Intents.all()
bot = commands.Bot(command_prefix="/", intents=intents)

@bot.event
async def on_ready():
    print(f"✅ Logged in as {bot.user}")
    
    # Game activity status
    activity = discord.Game("Advanced AI in Sorani")
    
    await bot.change_presence(status=discord.Status.online, activity=activity)
    print("🎮 Set game activity: Advanced AI in Sorani")

@bot.command(name="ping")
async def ping(ctx):
    """Simple ping command for testing"""
    await ctx.send("🏓 Pong! Bot is working!")

@bot.command(name="status")
async def status(ctx):
    """Check bot status"""
    embed = discord.Embed(
        title="🤖 Bot Status", 
        description="Bot is online and functioning!",
        color=discord.Color.green()
    )
    embed.add_field(name="Latency", value=f"{round(bot.latency * 1000)}ms", inline=True)
    embed.add_field(name="Guilds", value=len(bot.guilds), inline=True)
    await ctx.send(embed=embed)

if __name__ == "__main__":
    # Get token from environment variable
    bot_token = os.getenv("DISCORD_BOT_TOKEN")
    
    if not bot_token:
        print("❌ Error: DISCORD_BOT_TOKEN not found in environment variables")
        print("Please check your .env file or set the environment variable")
        exit(1)
    
    try:
        print("🚀 Starting simple Discord bot test...")
        bot.run(bot_token)
    except discord.LoginFailure:
        print("❌ Invalid bot token. Please check your DISCORD_BOT_TOKEN")
    except Exception as e:
        print(f"❌ Error starting bot: {e}")