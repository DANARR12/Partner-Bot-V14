import discord
from discord.ext import commands, tasks
import json
import os
import datetime
import logging
from typing import Dict, Any, Optional

# ====== LOGGING SETUP ======
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ====== CONFIG ======
# SECURITY: Use environment variables for sensitive data
TOKEN = os.getenv("DISCORD_TOKEN")
if not TOKEN:
    logger.error("DISCORD_TOKEN environment variable not set!")
    exit(1)

TEXT_XP_PER_MESSAGE = int(os.getenv("TEXT_XP_PER_MESSAGE", "10"))
VOICE_XP_INTERVAL = int(os.getenv("VOICE_XP_INTERVAL", "60"))
VOICE_XP_PER_INTERVAL = int(os.getenv("VOICE_XP_PER_INTERVAL", "5"))
DATA_FILE = os.getenv("DATA_FILE", "xp_data.json")

# Rate limiting for text XP (prevent spam)
LAST_MESSAGE_TIME = {}  # {user_id: timestamp}
MESSAGE_COOLDOWN = 5  # seconds

# ====== BOT SETUP ======
intents = discord.Intents.default()
intents.messages = True
intents.message_content = True
intents.guilds = True
intents.members = True
intents.voice_states = True

bot = commands.Bot(command_prefix="", intents=intents)

# ====== DATA MANAGEMENT ======
class XPManager:
    def __init__(self, data_file: str):
        self.data_file = data_file
        self.xp_data = self.load_data()
    
    def load_data(self) -> Dict[str, Dict[str, int]]:
        """Load XP data from file with error handling"""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, "r") as f:
                    data = json.load(f)
                logger.info(f"Loaded data for {len(data)} users")
                return data
            else:
                logger.info("No existing data file found, starting fresh")
                return {}
        except (json.JSONDecodeError, IOError) as e:
            logger.error(f"Error loading data: {e}")
            # Backup corrupted file
            if os.path.exists(self.data_file):
                backup_name = f"{self.data_file}.backup.{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
                os.rename(self.data_file, backup_name)
                logger.info(f"Corrupted file backed up as {backup_name}")
            return {}
    
    def save_data(self) -> None:
        """Save XP data to file with error handling"""
        try:
            # Create temporary file first for atomic write
            temp_file = f"{self.data_file}.tmp"
            with open(temp_file, "w") as f:
                json.dump(self.xp_data, f, indent=4)
            
            # Replace original file
            os.replace(temp_file, self.data_file)
            logger.debug(f"Data saved successfully for {len(self.xp_data)} users")
        except IOError as e:
            logger.error(f"Error saving data: {e}")
    
    def ensure_user(self, user_id: int) -> None:
        """Ensure user exists in data with default values"""
        uid = str(user_id)
        if uid not in self.xp_data:
            self.xp_data[uid] = {
                "text_xp": 0, "voice_xp": 0,
                "daily_text_xp": 0, "daily_voice_xp": 0,
                "weekly_text_xp": 0, "weekly_voice_xp": 0,
                "last_message": 0  # timestamp for rate limiting
            }
            logger.debug(f"Created new user entry for {user_id}")
    
    def add_xp(self, user_id: int, xp_type: str, amount: int) -> bool:
        """Add XP to user with validation"""
        if amount <= 0:
            return False
        
        self.ensure_user(user_id)
        uid = str(user_id)
        
        try:
            self.xp_data[uid][xp_type] += amount
            
            # Update corresponding daily/weekly counters
            if xp_type == "text_xp":
                self.xp_data[uid]["daily_text_xp"] += amount
                self.xp_data[uid]["weekly_text_xp"] += amount
            elif xp_type == "voice_xp":
                self.xp_data[uid]["daily_voice_xp"] += amount
                self.xp_data[uid]["weekly_voice_xp"] += amount
            
            self.save_data()
            logger.debug(f"Added {amount} {xp_type} to user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Error adding XP: {e}")
            return False
    
    def get_rank(self, user_id: int, xp_type: str) -> Optional[int]:
        """Get user's rank for specific XP type"""
        try:
            sorted_users = sorted(
                self.xp_data.items(), 
                key=lambda x: x[1].get(xp_type, 0), 
                reverse=True
            )
            for rank, (uid, _) in enumerate(sorted_users, start=1):
                if int(uid) == user_id:
                    return rank
            return None
        except Exception as e:
            logger.error(f"Error getting rank: {e}")
            return None
    
    def reset_daily(self) -> None:
        """Reset daily XP counters"""
        try:
            for user_data in self.xp_data.values():
                user_data["daily_text_xp"] = 0
                user_data["daily_voice_xp"] = 0
            self.save_data()
            logger.info("Daily XP counters reset")
        except Exception as e:
            logger.error(f"Error resetting daily XP: {e}")
    
    def reset_weekly(self) -> None:
        """Reset weekly XP counters"""
        try:
            for user_data in self.xp_data.values():
                user_data["weekly_text_xp"] = 0
                user_data["weekly_voice_xp"] = 0
            self.save_data()
            logger.info("Weekly XP counters reset")
        except Exception as e:
            logger.error(f"Error resetting weekly XP: {e}")

# Initialize XP manager
xp_manager = XPManager(DATA_FILE)

# ====== UTILITY FUNCTIONS ======
def can_gain_text_xp(user_id: int) -> bool:
    """Check if user can gain text XP (rate limiting)"""
    now = datetime.datetime.now().timestamp()
    last_time = LAST_MESSAGE_TIME.get(user_id, 0)
    
    if now - last_time >= MESSAGE_COOLDOWN:
        LAST_MESSAGE_TIME[user_id] = now
        return True
    return False

# ====== VOICE XP LOOP (Anti-AFK) ======
@tasks.loop(seconds=VOICE_XP_INTERVAL)
async def give_voice_xp():
    """Give XP to users in voice channels (excluding AFK and muted users)"""
    try:
        total_users = 0
        for guild in bot.guilds:
            afk_channel = guild.afk_channel
            for vc in guild.voice_channels:
                if vc == afk_channel:
                    continue
                
                for member in vc.members:
                    if member.bot:
                        continue
                    
                    # Skip muted/deafened users
                    if (member.voice.self_mute or member.voice.self_deaf or 
                        member.voice.mute or member.voice.deaf):
                        continue
                    
                    if xp_manager.add_xp(member.id, "voice_xp", VOICE_XP_PER_INTERVAL):
                        total_users += 1
        
        if total_users > 0:
            logger.debug(f"Gave voice XP to {total_users} users")
    except Exception as e:
        logger.error(f"Error in voice XP loop: {e}")

@give_voice_xp.before_loop
async def before_voice_xp():
    await bot.wait_until_ready()
    logger.info("Voice XP loop started")

# ====== DAILY RESET ======
@tasks.loop(time=datetime.time(0, 0))  # Run at midnight
async def reset_daily():
    """Reset daily XP counters at midnight"""
    try:
        xp_manager.reset_daily()
    except Exception as e:
        logger.error(f"Error in daily reset: {e}")

@reset_daily.before_loop
async def before_daily_reset():
    await bot.wait_until_ready()
    logger.info("Daily reset loop started")

# ====== WEEKLY RESET ======
@tasks.loop(time=datetime.time(0, 0))  # Run at midnight
async def reset_weekly():
    """Reset weekly XP counters every Monday at midnight"""
    if datetime.datetime.now().weekday() == 0:  # Monday
        try:
            xp_manager.reset_weekly()
        except Exception as e:
            logger.error(f"Error in weekly reset: {e}")

@reset_weekly.before_loop
async def before_weekly_reset():
    await bot.wait_until_ready()
    logger.info("Weekly reset loop started")

# ====== EVENTS ======
@bot.event
async def on_ready():
    """Bot ready event"""
    logger.info(f"✅ Logged in as {bot.user}")
    logger.info(f"Bot is in {len(bot.guilds)} guilds")
    
    # Start background tasks
    give_voice_xp.start()
    reset_daily.start()
    reset_weekly.start()

@bot.event
async def on_message(message):
    """Handle incoming messages"""
    if message.author.bot:
        return
    
    try:
        # Rate limiting for text XP
        if can_gain_text_xp(message.author.id):
            xp_manager.add_xp(message.author.id, "text_xp", TEXT_XP_PER_MESSAGE)
        
        # Handle leaderboard commands
        msg = message.content.strip().lower()
        if msg == "t":
            await send_leaderboard(message.channel, message.author, "text_xp", "voice_xp", "All-Time")
        elif msg == "t day":
            await send_leaderboard(message.channel, message.author, "daily_text_xp", "daily_voice_xp", "Daily")
        elif msg == "t week":
            await send_leaderboard(message.channel, message.author, "weekly_text_xp", "weekly_voice_xp", "Weekly")
    except Exception as e:
        logger.error(f"Error handling message: {e}")

@bot.event
async def on_error(event, *args, **kwargs):
    """Global error handler"""
    logger.error(f"Error in event {event}: {args}", exc_info=True)

# ====== LEADERBOARD FUNCTION ======
async def send_leaderboard(channel, author, text_key: str, voice_key: str, period_name: str):
    """Send leaderboard embed to channel"""
    try:
        embed = discord.Embed(
            title=f"📋 {period_name} Guild Score Leaderboards",
            color=discord.Color.gold(),
            timestamp=datetime.datetime.now()
        )
        
        # ----- TEXT LEADERBOARD -----
        sorted_text = sorted(
            xp_manager.xp_data.items(), 
            key=lambda x: x[1].get(text_key, 0), 
            reverse=True
        )
        text_lines = []
        
        for i, (uid, data) in enumerate(sorted_text[:5], start=1):
            try:
                member = channel.guild.get_member(int(uid))
                if member:
                    name = member.display_name
                    mention = member.mention
                else:
                    name = f"User {uid}"
                    mention = name
                
                xp_value = data.get(text_key, 0)
                text_lines.append(f"**#{i}** {mention} - {xp_value:,} XP")
            except Exception as e:
                logger.error(f"Error processing user {uid}: {e}")
                continue
        
        # Add author's rank if not in top 5
        author_rank_text = xp_manager.get_rank(author.id, text_key)
        if author_rank_text and author_rank_text > 5:
            author_xp = xp_manager.xp_data.get(str(author.id), {}).get(text_key, 0)
            text_lines.append(f"\n**#{author_rank_text}** {author.mention} - {author_xp:,} XP")
        
        embed.add_field(
            name="🔥 TOP 5 TEXT 💬",
            value="\n".join(text_lines) if text_lines else "No data available",
            inline=False
        )
        
        # ----- VOICE LEADERBOARD -----
        sorted_voice = sorted(
            xp_manager.xp_data.items(), 
            key=lambda x: x[1].get(voice_key, 0), 
            reverse=True
        )
        voice_lines = []
        
        for i, (uid, data) in enumerate(sorted_voice[:5], start=1):
            try:
                member = channel.guild.get_member(int(uid))
                if member:
                    name = member.display_name
                    mention = member.mention
                else:
                    name = f"User {uid}"
                    mention = name
                
                xp_value = data.get(voice_key, 0)
                voice_lines.append(f"**#{i}** {mention} - {xp_value:,} XP")
            except Exception as e:
                logger.error(f"Error processing user {uid}: {e}")
                continue
        
        # Add author's rank if not in top 5
        author_rank_voice = xp_manager.get_rank(author.id, voice_key)
        if author_rank_voice and author_rank_voice > 5:
            author_xp = xp_manager.xp_data.get(str(author.id), {}).get(voice_key, 0)
            voice_lines.append(f"\n**#{author_rank_voice}** {author.mention} - {author_xp:,} XP")
        
        embed.add_field(
            name="🎤 TOP 5 VOICE 🎙️",
            value="\n".join(voice_lines) if voice_lines else "No data available",
            inline=False
        )
        
        # Add footer with user's current stats
        user_data = xp_manager.xp_data.get(str(author.id), {})
        embed.set_footer(
            text=f"Your {period_name.lower()} stats: Text: {user_data.get(text_key, 0):,} XP | Voice: {user_data.get(voice_key, 0):,} XP"
        )
        
        await channel.send(embed=embed)
        logger.debug(f"Sent {period_name} leaderboard to {channel.guild.name}")
        
    except Exception as e:
        logger.error(f"Error sending leaderboard: {e}")
        try:
            await channel.send("❌ Error generating leaderboard. Please try again later.")
        except:
            pass

# ====== SLASH COMMANDS ======
@bot.tree.command(name="stats", description="View your XP statistics")
async def stats_command(interaction: discord.Interaction):
    """Show user's XP stats"""
    try:
        user_data = xp_manager.xp_data.get(str(interaction.user.id), {})
        
        embed = discord.Embed(
            title=f"📊 {interaction.user.display_name}'s Stats",
            color=discord.Color.blue(),
            timestamp=datetime.datetime.now()
        )
        
        # All-time stats
        total_xp = user_data.get("text_xp", 0) + user_data.get("voice_xp", 0)
        embed.add_field(
            name="🏆 All-Time",
            value=f"**Total:** {total_xp:,} XP\n**Text:** {user_data.get('text_xp', 0):,} XP\n**Voice:** {user_data.get('voice_xp', 0):,} XP",
            inline=True
        )
        
        # Daily stats
        daily_total = user_data.get("daily_text_xp", 0) + user_data.get("daily_voice_xp", 0)
        embed.add_field(
            name="📅 Today",
            value=f"**Total:** {daily_total:,} XP\n**Text:** {user_data.get('daily_text_xp', 0):,} XP\n**Voice:** {user_data.get('daily_voice_xp', 0):,} XP",
            inline=True
        )
        
        # Weekly stats
        weekly_total = user_data.get("weekly_text_xp", 0) + user_data.get("weekly_voice_xp", 0)
        embed.add_field(
            name="📊 This Week",
            value=f"**Total:** {weekly_total:,} XP\n**Text:** {user_data.get('weekly_text_xp', 0):,} XP\n**Voice:** {user_data.get('weekly_voice_xp', 0):,} XP",
            inline=True
        )
        
        # Ranks
        text_rank = xp_manager.get_rank(interaction.user.id, "text_xp")
        voice_rank = xp_manager.get_rank(interaction.user.id, "voice_xp")
        
        embed.add_field(
            name="🏅 Your Ranks",
            value=f"**Text Rank:** #{text_rank or 'N/A'}\n**Voice Rank:** #{voice_rank or 'N/A'}",
            inline=False
        )
        
        await interaction.response.send_message(embed=embed)
        
    except Exception as e:
        logger.error(f"Error in stats command: {e}")
        await interaction.response.send_message("❌ Error retrieving stats.", ephemeral=True)

# ====== ERROR HANDLING ======
@bot.event
async def on_command_error(ctx, error):
    """Handle command errors"""
    logger.error(f"Command error: {error}")

# ====== START BOT ======
if __name__ == "__main__":
    try:
        bot.run(TOKEN)
    except Exception as e:
        logger.error(f"Failed to start bot: {e}")