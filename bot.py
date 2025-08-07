import nextcord
from nextcord.ext import commands, tasks
import feedparser
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

TOKEN = os.getenv("DISCORD_BOT_TOKEN")
CHANNEL_ID = int(os.getenv("CHANNEL_ID", "0"))
RSS_FEED = "https://news.xbox.com/en-us/feed/"  # Xbox official news feed

intents = nextcord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)

latest_post = None  # Global to store last posted item

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user}")
    print(f"Monitoring channel ID: {CHANNEL_ID}")
    check_news.start()

@tasks.loop(minutes=30)
async def check_news():
    global latest_post
    try:
        feed = feedparser.parse(RSS_FEED)
        
        if feed.entries:
            latest = feed.entries[0]
            if latest_post != latest.link:
                channel = bot.get_channel(CHANNEL_ID)
                if channel:
                    message = f"📰 **{latest.title}**\n{latest.link}"
                    await channel.send(message)
                    latest_post = latest.link
                    print(f"Posted news: {latest.title}")
                else:
                    print(f"Channel with ID {CHANNEL_ID} not found")
        else:
            print("No entries found in RSS feed")
    except Exception as e:
        print(f"Error checking news: {e}")

@check_news.before_loop
async def before_check_news():
    await bot.wait_until_ready()

@bot.command()
async def gamepassnews(ctx):
    """Manually fetch latest Xbox Game Pass news"""
    try:
        feed = feedparser.parse(RSS_FEED)
        if feed.entries:
            entry = feed.entries[0]
            await ctx.send(f"🕹️ **{entry.title}**\n{entry.link}")
        else:
            await ctx.send("No news found.")
    except Exception as e:
        await ctx.send(f"Error fetching news: {e}")
        print(f"Error in gamepassnews command: {e}")

@bot.command()
async def ping(ctx):
    """Check if the bot is responsive"""
    await ctx.send("Pong! 🏓")

if __name__ == "__main__":
    if not TOKEN:
        print("Error: DISCORD_BOT_TOKEN not found in environment variables")
        exit(1)
    if CHANNEL_ID == 0:
        print("Error: CHANNEL_ID not found in environment variables")
        exit(1)
    
    bot.run(TOKEN)