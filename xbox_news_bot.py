import nextcord
from nextcord.ext import commands, tasks
import feedparser
import json
import os
from datetime import datetime

TOKEN = os.getenv("XBOX_BOT_TOKEN", "YOUR_BOT_TOKEN")
RSS_FEED = "https://news.xbox.com/en-us/feed/"
CONFIG_FILE = "xbox_config.json"

intents = nextcord.Intents.default()
intents.guilds = True
intents.messages = True

bot = commands.Bot(command_prefix="!", intents=intents)

latest_post = None

# Load saved config
def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    return {}

# Save config
def save_config(config):
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=4)

config = load_config()

@bot.event
async def on_ready():
    print(f"✅ Logged in as {bot.user}")
    print(f"📰 Monitoring Xbox news feed: {RSS_FEED}")
    print(f"🔄 Checking for updates every 30 minutes")
    check_news.start()

@tasks.loop(minutes=30)
async def check_news():
    global latest_post
    try:
        print(f"🔍 Checking for new Xbox news at {datetime.now()}")
        feed = feedparser.parse(RSS_FEED)

        if feed.entries:
            latest = feed.entries[0]
            if latest_post != latest.link:
                print(f"📢 New post found: {latest.title}")
                for guild_id, chan_id in config.items():
                    channel = bot.get_channel(chan_id)
                    if channel:
                        try:
                            embed = nextcord.Embed(
                                title=latest.title,
                                url=latest.link,
                                description=latest.summary[:200] + "..." if len(latest.summary) > 200 else latest.summary,
                                color=0x107C10  # Xbox green
                            )
                            embed.set_author(
                                name="Xbox News", 
                                icon_url="https://upload.wikimedia.org/wikipedia/commons/4/43/Xbox_one_logo.svg"
                            )
                            embed.set_footer(text=f"Posted on {latest.published}")
                            await channel.send(embed=embed)
                            print(f"✅ Posted to {channel.name} in {channel.guild.name}")
                        except Exception as e:
                            print(f"❌ Error posting to {channel.name}: {e}")
                    else:
                        print(f"⚠️ Channel {chan_id} not found for guild {guild_id}")
                latest_post = latest.link
            else:
                print("📰 No new posts found")
        else:
            print("⚠️ No entries found in RSS feed")
    except Exception as e:
        print(f"❌ Error checking news: {e}")

@bot.command()
@commands.has_permissions(administrator=True)
async def setup(ctx, channel: nextcord.TextChannel):
    """Set the news posting channel for this server"""
    config[str(ctx.guild.id)] = channel.id
    save_config(config)
    
    embed = nextcord.Embed(
        title="✅ Setup Complete",
        description=f"Xbox news will be posted in {channel.mention}",
        color=0x107C10
    )
    embed.set_footer(text="Xbox Game Pass News Bot")
    await ctx.send(embed=embed)
    print(f"📋 Setup complete for {ctx.guild.name} -> #{channel.name}")

@bot.command()
async def latest(ctx, count: int = 3):
    """Show latest Xbox news headlines (max 5)"""
    try:
        feed = feedparser.parse(RSS_FEED)
        count = min(count, 5)
        if feed.entries:
            embed = nextcord.Embed(
                title="📰 Latest Xbox News",
                color=0x107C10,
                timestamp=datetime.utcnow()
            )
            for entry in feed.entries[:count]:
                embed.add_field(
                    name=entry.title[:256],  # Discord field name limit
                    value=f"[Read More]({entry.link})",
                    inline=False
                )
            embed.set_footer(text="Xbox News RSS Feed")
            await ctx.send(embed=embed)
        else:
            await ctx.send("❌ No news found in the RSS feed.")
    except Exception as e:
        await ctx.send(f"❌ Error fetching news: {str(e)}")
        print(f"❌ Error in latest command: {e}")

@bot.command()
@commands.has_permissions(administrator=True)
async def remove_channel(ctx):
    """Remove the news channel for this server"""
    guild_id = str(ctx.guild.id)
    if guild_id in config:
        del config[guild_id]
        save_config(config)
        embed = nextcord.Embed(
            title="✅ Channel Removed",
            description="Xbox news posting has been disabled for this server.",
            color=0x107C10
        )
        await ctx.send(embed=embed)
    else:
        await ctx.send("❌ No news channel was configured for this server.")

@bot.command()
async def info(ctx):
    """Show bot information and configured channels"""
    embed = nextcord.Embed(
        title="🎮 Xbox News Bot Info",
        color=0x107C10,
        timestamp=datetime.utcnow()
    )
    embed.add_field(name="📡 RSS Feed", value=RSS_FEED, inline=False)
    embed.add_field(name="🔄 Check Interval", value="30 minutes", inline=True)
    embed.add_field(name="🏠 Configured Servers", value=str(len(config)), inline=True)
    
    guild_id = str(ctx.guild.id)
    if guild_id in config:
        channel = bot.get_channel(config[guild_id])
        if channel:
            embed.add_field(name="📺 Current Channel", value=channel.mention, inline=False)
        else:
            embed.add_field(name="📺 Current Channel", value="❌ Channel not found", inline=False)
    else:
        embed.add_field(name="📺 Current Channel", value="❌ Not configured", inline=False)
    
    embed.set_footer(text="Use !setup #channel to configure news posting")
    await ctx.send(embed=embed)

if __name__ == "__main__":
    if TOKEN == "YOUR_BOT_TOKEN":
        print("❌ Please set the XBOX_BOT_TOKEN environment variable")
        print("Example: export XBOX_BOT_TOKEN='your_actual_token_here'")
    else:
        bot.run(TOKEN)