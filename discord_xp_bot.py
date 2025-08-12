import discord
from discord.ext import commands, tasks
import json
import os
import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ====== CONFIG ======
TOKEN = os.getenv("DISCORD_TOKEN")
if not TOKEN:
    raise ValueError("DISCORD_TOKEN environment variable not set!")

TEXT_XP_PER_MESSAGE = 10
VOICE_XP_INTERVAL = 60
VOICE_XP_PER_INTERVAL = 5
DATA_FILE = "xp_data.json"

# ====== BOT SETUP ======
intents = discord.Intents.default()
intents.messages = True
intents.message_content = True
intents.guilds = True
intents.members = True
intents.voice_states = True

bot = commands.Bot(command_prefix="", intents=intents)  # No prefix, we check manually

# ====== LOAD DATA ======
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "r") as f:
        xp_data = json.load(f)
else:
    xp_data = {}  # {user_id: {xp fields...}}

def save_data():
    with open(DATA_FILE, "w") as f:
        json.dump(xp_data, f, indent=4)

def ensure_user(user_id: int):
    uid = str(user_id)
    if uid not in xp_data:
        xp_data[uid] = {
            "text_xp": 0, "voice_xp": 0,
            "daily_text_xp": 0, "daily_voice_xp": 0,
            "weekly_text_xp": 0, "weekly_voice_xp": 0
        }

def add_xp(user_id: int, xp_type: str, amount: int):
    ensure_user(user_id)
    xp_data[str(user_id)][xp_type] += amount
    # also update corresponding daily/weekly
    if xp_type == "text_xp":
        xp_data[str(user_id)]["daily_text_xp"] += amount
        xp_data[str(user_id)]["weekly_text_xp"] += amount
    elif xp_type == "voice_xp":
        xp_data[str(user_id)]["daily_voice_xp"] += amount
        xp_data[str(user_id)]["weekly_voice_xp"] += amount
    save_data()

def get_rank(user_id: int, xp_type: str):
    sorted_users = sorted(xp_data.items(), key=lambda x: x[1][xp_type], reverse=True)
    for rank, (uid, _) in enumerate(sorted_users, start=1):
        if int(uid) == user_id:
            return rank
    return None

# ====== VOICE XP LOOP (Anti-AFK) ======
@tasks.loop(seconds=VOICE_XP_INTERVAL)
async def give_voice_xp():
    for guild in bot.guilds:
        afk_channel = guild.afk_channel
        for vc in guild.voice_channels:
            if vc == afk_channel:
                continue
            for member in vc.members:
                if member.bot:
                    continue
                if member.voice.self_mute or member.voice.self_deaf:
                    continue
                if member.voice.mute or member.voice.deaf:
                    continue
                add_xp(member.id, "voice_xp", VOICE_XP_PER_INTERVAL)

@give_voice_xp.before_loop
async def before_voice_xp():
    await bot.wait_until_ready()

# ====== DAILY RESET ======
@tasks.loop(hours=24)
async def reset_daily():
    for user in xp_data.values():
        user["daily_text_xp"] = 0
        user["daily_voice_xp"] = 0
    save_data()

@reset_daily.before_loop
async def before_daily_reset():
    await bot.wait_until_ready()

# ====== WEEKLY RESET ======
@tasks.loop(hours=24*7)
async def reset_weekly():
    for user in xp_data.values():
        user["weekly_text_xp"] = 0
        user["weekly_voice_xp"] = 0
    save_data()

@reset_weekly.before_loop
async def before_weekly_reset():
    await bot.wait_until_ready()

# ====== EVENTS ======
@bot.event
async def on_ready():
    print(f"✅ Logged in as {bot.user}")
    give_voice_xp.start()
    reset_daily.start()
    reset_weekly.start()

@bot.event
async def on_message(message):
    if message.author.bot:
        return

    add_xp(message.author.id, "text_xp", TEXT_XP_PER_MESSAGE)

    msg = message.content.strip().lower()
    if msg == "t":
        await send_leaderboard(message.channel, message.author, "text_xp", "voice_xp", "All-Time")
    elif msg == "t day":
        await send_leaderboard(message.channel, message.author, "daily_text_xp", "daily_voice_xp", "Daily")
    elif msg == "t week":
        await send_leaderboard(message.channel, message.author, "weekly_text_xp", "weekly_voice_xp", "Weekly")

# ====== LEADERBOARD FUNCTION ======
async def send_leaderboard(channel, author, text_key, voice_key, period_name):
    embed = discord.Embed(
        title=f"📋 {period_name} Guild Score Leaderboards",
        color=discord.Color.gold()
    )

    # ----- TEXT -----
    sorted_text = sorted(xp_data.items(), key=lambda x: x[1][text_key], reverse=True)
    text_lines = []
    for i, (uid, data) in enumerate(sorted_text[:5], start=1):
        member = channel.guild.get_member(int(uid))
        name = member.display_name if member else f"User {uid}"
        text_lines.append(f"**#{i}** {member.mention if member else name} XP: {data[text_key]}")
    author_rank_text = get_rank(author.id, text_key)
    if author_rank_text and author_rank_text > 5:
        text_lines.append(f"\n**#{author_rank_text}** {author.mention} XP: {xp_data[str(author.id)][text_key]}")
    embed.add_field(
        name=f"TOP 5 TEXT 💬",
        value="\n".join(text_lines) + "\n\n✨ More? `/top text`",
        inline=False
    )

    # ----- VOICE -----
    sorted_voice = sorted(xp_data.items(), key=lambda x: x[1][voice_key], reverse=True)
    voice_lines = []
    for i, (uid, data) in enumerate(sorted_voice[:5], start=1):
        member = channel.guild.get_member(int(uid))
        name = member.display_name if member else f"User {uid}"
        voice_lines.append(f"**#{i}** {member.mention if member else name} XP: {data[voice_key]}")
    author_rank_voice = get_rank(author.id, voice_key)
    if author_rank_voice and author_rank_voice > 5:
        voice_lines.append(f"\n**#{author_rank_voice}** {author.mention} XP: {xp_data[str(author.id)][voice_key]}")
    embed.add_field(
        name=f"TOP 5 VOICE 🎙️",
        value="\n".join(voice_lines) + "\n\n✨ More? `/top voice`",
        inline=False
    )

    await channel.send(embed=embed)

# ====== START BOT ======
if __name__ == "__main__":
    bot.run(TOKEN)