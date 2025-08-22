""" Discord Kurdish AI Bot — Advanced Python Template

Features:
- Discord slash commands + message command
- Kurdish-first AI replies (Kurmanji/Sorani autodetect with override)
- Conversation memory per user/server with persistence (SQLite via aiosqlite)
- OpenAI responses with streaming-style incremental edits
- Moderation gate + safety fallback
- Rate limiting & retries with exponential backoff
- Structured logging
- Config via environment variables (.env supported)

Requirements (pip): python -m pip install -U discord.py aiosqlite python-dotenv openai tiktoken tenacity

Env Vars (create .env):
DISCORD_BOT_TOKEN=...
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
KURDISH_DIALECT=auto   # "auto" | "kurmanji" | "sorani"
MAX_HISTORY=10         # messages per user per channel to keep in memory
OWNER_IDS=123456789012345678,987654321098765432

Run: python main.py
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import signal
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
from pathlib import Path

import aiosqlite
import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import View, Button
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

# OpenAI (v1+ SDK)
try:
    from openai import AsyncOpenAI
except Exception:  # pragma: no cover
    AsyncOpenAI = None  # type: ignore

# -------------------- Config & Logging --------------------

load_dotenv()

DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
KURDISH_DIALECT = os.getenv("KURDISH_DIALECT", "auto").lower()
MAX_HISTORY = int(os.getenv("MAX_HISTORY", "10"))
OWNER_IDS = {int(x) for x in re.findall(r"\d+", os.getenv("OWNER_IDS", ""))}
DB_PATH = os.getenv("DB_PATH", "memory.sqlite3")

if not DISCORD_BOT_TOKEN:
    raise SystemExit("Missing DISCORD_BOT_TOKEN in env")
if not OPENAI_API_KEY:
    raise SystemExit("Missing OPENAI_API_KEY in env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
log = logging.getLogger("kurdish-bot")

# -------------------- Persistence Layer --------------------

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS memory (
    guild_id    INTEGER,
    channel_id  INTEGER,
    user_id     INTEGER,
    messages    TEXT,
    PRIMARY KEY (guild_id, channel_id, user_id)
);
"""

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(CREATE_TABLE_SQL)
        await db.commit()

async def get_history(guild_id: int, channel_id: int, user_id: int) -> List[Dict[str, str]]:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT messages FROM memory WHERE guild_id=? AND channel_id=? AND user_id=?",
            (guild_id, channel_id, user_id),
        ) as cur:
            row = await cur.fetchone()
            if row and row[0]:
                try:
                    return json.loads(row[0])
                except Exception:
                    return []
            return []

async def save_history(guild_id: int, channel_id: int, user_id: int, messages: List[Dict[str, str]]):
    # Cap length
    trimmed = messages[-MAX_HISTORY:]
    payload = json.dumps(trimmed, ensure_ascii=False)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "REPLACE INTO memory (guild_id, channel_id, user_id, messages) VALUES (?, ?, ?, ?)",
            (guild_id, channel_id, user_id, payload),
        )
        await db.commit()

async def clear_history(guild_id: int, channel_id: int, user_id: int):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "DELETE FROM memory WHERE guild_id=? AND channel_id=? AND user_id=?",
            (guild_id, channel_id, user_id),
        )
        await db.commit()

# -------------------- OpenAI Client Helpers --------------------

@dataclass
class AIConfig:
    model: str
    dialect: str  # auto | kurmanji | sorani

    def system_prompt(self) -> str:
        dialect_note = {
            "auto": (
                "Ji naveroka bikarhênerê awa hewl bide ziman û lehcayê bibînî."
                " Heger text bi kurmancî be, bersiv bi Kurmancî bide; heger bi soranî (سۆرانی) be,"
                " bersiv bi سۆرانی bide. Heger peywenda heman dizî be, di heman zimanê bikarhêner de binivîse."
            ),
            "kurmanji": "Hemû bersivên xwe tenê bi Kurmancî bide, bi rêz û zimanê xwerû.",
            "sorani": "هەموو وەڵامەکانت تەنها بە کوردی سۆرانی بنوسە. هەرگیز زمانێکی تر بەکار مەهێنە.",
        }[self.dialect]
        base = (
            "تۆ یاریدەدەری AI ی دیسکۆردیت. وەڵامەکانت کورت و بەسوود بن."
            " دڵنیابە لەوەی پەیامەکانت گونجاو و بە ڕێزن."
        )
        return f"{base}\n\n{dialect_note}"

class AIError(Exception):
    pass

class ModerationFlag(Exception):
    pass

class AI:
    def __init__(self, api_key: str, cfg: AIConfig):
        if AsyncOpenAI is None:
            raise RuntimeError("openai python sdk v1+ is required")
        self.client = AsyncOpenAI(api_key=api_key)
        self.cfg = cfg

    @retry(
        wait=wait_exponential(multiplier=1, min=1, max=10),
        stop=stop_after_attempt(3),
        retry=retry_if_exception_type((AIError, asyncio.TimeoutError)),
        reraise=True,
    )
    async def moderate(self, text: str) -> None:
        try:
            # Lightweight heuristic: use text-embedding-3-large moderation endpoint if available. Fallback to responses.
            result = await self.client.moderations.create(
                model="omni-moderation-latest",
                input=text,
            )
            categories = result.results[0].categories
            flagged = result.results[0].flagged
            if flagged:
                raise ModerationFlag(str(categories))
        except ModerationFlag:
            raise
        except Exception as e:  # Treat moderation failure as soft-allow
            log.warning("Moderation check failed: %s", e)

    @retry(
        wait=wait_exponential(multiplier=1, min=1, max=15),
        stop=stop_after_attempt(3),
        retry=retry_if_exception_type((AIError, asyncio.TimeoutError)),
        reraise=True,
    )
    async def chat(self, history: List[Dict[str, str]], user_input: str) -> str:
        try:
            msgs = [{"role": "system", "content": self.cfg.system_prompt()}]
            msgs.extend(history)
            msgs.append({"role": "user", "content": user_input})

            # Stream tokens and aggregate for incremental edits
            stream = await self.client.chat.completions.create(
                model=self.cfg.model,
                messages=msgs,
                stream=True,
                temperature=0.5,
            )
            out = []
            async for chunk in stream:
                delta = chunk.choices[0].delta.content or ""
                if delta:
                    out.append(delta)
            return "".join(out).strip()
        except Exception as e:
            raise AIError(str(e))

# -------------------- Voice Processing (TTS/STT) --------------------

async def ai_reply_sorani(user_text: str) -> str:
    """Direct AI reply in Sorani only"""
    try:
        completion = await ai.client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "هەموو وەڵامەکانت تەنها بە کوردی سۆرانی بنوسە. هەرگیز زمانێکی تر بەکار مەهێنە."},
                {"role": "user", "content": user_text},
            ]
        )
        return completion.choices[0].message.content
    except Exception as e:
        log.exception("Sorani AI reply failed: %s", e)
        raise AIError(str(e))

async def tts_sorani(text: str, filename: str = "sorani_tts.mp3") -> str:
    """Convert Sorani text to speech"""
    try:
        response = await ai.client.audio.speech.create(
            model="tts-1",  # Using correct OpenAI TTS model
            voice="alloy",  # Available voices: alloy, echo, fable, onyx, nova, shimmer
            input=text
        )
        
        file_path = f"downloads/{filename}"
        with open(file_path, "wb") as f:
            f.write(response.content)
        return file_path
    except Exception as e:
        log.exception("Sorani TTS generation failed: %s", e)
        raise

async def tts_kurdish(text: str, filename: str = "tts.mp3") -> str:
    """Generate Kurdish TTS audio file (legacy function)"""
    return await tts_sorani(text, filename)

async def stt_kurdish(file_path: str) -> str:
    """Transcribe Kurdish audio to text"""
    try:
        with open(file_path, "rb") as audio_file:
            transcript = await ai.client.audio.transcriptions.create(
                model="whisper-1",  # Using correct OpenAI Whisper model
                file=audio_file,
                language="ku"  # Kurdish language code
            )
        return transcript.text
    except Exception as e:
        log.exception("STT transcription failed: %s", e)
        raise

# -------------------- UI Components --------------------

class KurdishView(View):
    def __init__(self, message_content: str = ""):
        super().__init__(timeout=None)
        self.message_content = message_content
    
    @discord.ui.button(label="🔄 Kurmancî", style=discord.ButtonStyle.secondary, custom_id="to_kurmanji")
    async def to_kurmanji(self, interaction: discord.Interaction, button: Button):
        await interaction.response.defer(ephemeral=True)
        
        # Get the original message
        message = interaction.message
        if not message or not message.content:
            await interaction.followup.send("⚠️ پەیامێک نەدۆزرایەوە بۆ وەرگێڕان.", ephemeral=True)
            return
        
        async with openai_sema:
            try:
                # Force Kurmanji translation
                temp_ai = AI(api_key=OPENAI_API_KEY, cfg=AIConfig(model=OPENAI_MODEL, dialect="kurmanji"))
                prompt = f"ئەم دەقە بۆ کوردیی کورمانجی وەربگێڕە:\n\n{message.content}"
                translation = await temp_ai.chat([], prompt)
                await interaction.followup.send(f"**Kurmancî:** {as_discord_safe(translation)}", ephemeral=True)
            except Exception as e:
                log.exception("Kurmanji translation failed: %s", e)
                await interaction.followup.send("❌ وەرگێڕان سەرکەوتوو نەبوو.", ephemeral=True)
    
    @discord.ui.button(label="🔄 سۆرانی", style=discord.ButtonStyle.secondary, custom_id="to_sorani")
    async def to_sorani(self, interaction: discord.Interaction, button: Button):
        await interaction.response.defer(ephemeral=True)
        
        # Get the original message
        message = interaction.message
        if not message or not message.content:
            await interaction.followup.send("⚠️ پەیامێک نەدۆزرایەوە بۆ وەرگێڕان.", ephemeral=True)
            return
        
        async with openai_sema:
            try:
                # Force Sorani translation
                temp_ai = AI(api_key=OPENAI_API_KEY, cfg=AIConfig(model=OPENAI_MODEL, dialect="sorani"))
                prompt = f"ئەم دەقە بۆ کوردیی سۆرانی وەربگێڕە:\n\n{message.content}"
                translation = await temp_ai.chat([], prompt)
                await interaction.followup.send(f"**سۆرانی:** {as_discord_safe(translation)}", ephemeral=True)
            except Exception as e:
                log.exception("Sorani translation failed: %s", e)
                await interaction.followup.send("❌ وەرگێڕان سەرکەوتوو نەبوو.", ephemeral=True)
    
    @discord.ui.button(label="🔊 Speak", style=discord.ButtonStyle.success, custom_id="speak_message")
    async def speak_message(self, interaction: discord.Interaction, button: Button):
        await interaction.response.defer(ephemeral=True)
        
        # Check if user is in voice channel
        if not interaction.user.voice or not interaction.user.voice.channel:
            await interaction.followup.send("⚠️ تکایە یەکەم جار بچۆرە ناو کەناڵی دەنگەوە.", ephemeral=True)
            return
        
        # Get the message content
        content = self.message_content or interaction.message.content
        if not content:
            await interaction.followup.send("⚠️ پەیامێک نەدۆزرایەوە بۆ قسەکردن.", ephemeral=True)
            return
        
        try:
            # Connect to voice channel if not already connected
            voice_client = interaction.guild.voice_client
            if not voice_client:
                voice_client = await interaction.user.voice.channel.connect()
            
            # Generate TTS
            import time
            filename = f"tts_{int(time.time())}.mp3"
            audio_path = await tts_kurdish(content, filename)
            
            # Play audio
            if voice_client.is_playing():
                voice_client.stop()
            
            source = discord.FFmpegPCMAudio(audio_path)
            voice_client.play(source)
            
            await interaction.followup.send(f"🗣️ دەنگی کرد: {content[:100]}{'...' if len(content) > 100 else ''}", ephemeral=True)
            
            # Clean up audio file after playing
            def cleanup(error):
                if error:
                    log.error(f"Audio playback error: {error}")
                try:
                    os.remove(audio_path)
                except:
                    pass
            
            source.cleanup = cleanup
            
        except Exception as e:
            log.exception("TTS playback failed: %s", e)
            await interaction.followup.send("❌ دەنگکردن سەرکەوتوو نەبوو.", ephemeral=True)

# -------------------- Discord Bot --------------------

intents = discord.Intents.default()
intents.message_content = True  # needed for prefix and context menu
intents.voice_states = True     # needed for voice channel functionality

bot = commands.Bot(command_prefix="!", intents=intents)
ai = AI(api_key=OPENAI_API_KEY, cfg=AIConfig(model=OPENAI_MODEL, dialect=KURDISH_DIALECT))

# Simple in-process semaphore to throttle concurrent OpenAI calls
OPENAI_CONCURRENCY = int(os.getenv("OPENAI_CONCURRENCY", "3"))
openai_sema = asyncio.Semaphore(OPENAI_CONCURRENCY)

# Create downloads directory for voice messages
Path("downloads").mkdir(exist_ok=True)

# -------------------- Utilities --------------------

def as_discord_safe(text: str) -> str:
    # Prevent @everyone / mass mentions
    text = text.replace("@everyone", "@•everyone").replace("@here", "@•here")
    # Trim to Discord limit
    return text[:1900]  # leave room for extras

async def build_history(ctx_like, new_pair: Optional[Tuple[str, str]] = None) -> List[Dict[str, str]]:
    guild_id = ctx_like.guild.id if ctx_like.guild else 0
    channel_id = ctx_like.channel.id
    user_id = ctx_like.user.id if isinstance(ctx_like, discord.Interaction) else ctx_like.author.id

    hist = await get_history(guild_id, channel_id, user_id)
    if new_pair:
        u, a = new_pair
        hist.append({"role": "user", "content": u})
        if a:
            hist.append({"role": "assistant", "content": a})
    return hist

async def persist_history(ctx_like, messages: List[Dict[str, str]]):
    guild_id = ctx_like.guild.id if ctx_like.guild else 0
    channel_id = ctx_like.channel.id
    user_id = ctx_like.user.id if isinstance(ctx_like, discord.Interaction) else ctx_like.author.id
    await save_history(guild_id, channel_id, user_id, messages)

# -------------------- Commands --------------------

@bot.event
async def on_ready():
    await init_db()
    try:
        synced = await bot.tree.sync()
        log.info("Synced %d app commands", len(synced))
    except Exception as e:
        log.exception("Slash sync failed: %s", e)
    log.info("Logged in as %s", bot.user)

@bot.event
async def on_message(message):
    # Skip bot messages
    if message.author.bot:
        await bot.process_commands(message)
        return
    
    # Process voice message attachments
    if message.attachments:
        for attachment in message.attachments:
            # Check if it's an audio file
            if attachment.filename.lower().endswith(('.mp3', '.wav', '.m4a', '.ogg', '.webm', '.mp4')):
                try:
                    # Download the audio file
                    file_path = f"downloads/{attachment.filename}"
                    await attachment.save(file_path)
                    
                    # Transcribe the audio
                    async with message.channel.typing():
                        transcribed_text = await stt_kurdish(file_path)
                    
                    if transcribed_text.strip():
                        # Send transcription with translation buttons
                        view = KurdishView(message_content=transcribed_text)
                        embed = discord.Embed(
                            title="📝 Kurdish Voice Transcription",
                            description=transcribed_text,
                            color=discord.Color.blue()
                        )
                        embed.set_footer(text=f"From: {message.author.display_name}")
                        
                        await message.reply(embed=embed, view=view)
                        
                        # Optionally process as chat if it looks like a question/command
                        if any(word in transcribed_text.lower() for word in ['?', 'چی', 'چۆن', 'کێ', 'کوا', 'کەی', 'بۆچی']):
                            try:
                                # Get AI response to the transcribed voice message
                                hist = await get_history(
                                    message.guild.id if message.guild else 0, 
                                    message.channel.id, 
                                    message.author.id
                                )
                                reply = await ai.chat(hist, transcribed_text)
                                
                                # Save to history
                                hist.append({"role": "user", "content": transcribed_text})
                                hist.append({"role": "assistant", "content": reply})
                                await save_history(
                                    message.guild.id if message.guild else 0, 
                                    message.channel.id, 
                                    message.author.id, 
                                    hist
                                )
                                
                                # Send AI response with voice and translation buttons
                                ai_view = KurdishView(message_content=reply)
                                ai_embed = discord.Embed(
                                    title="🤖 Kurdish AI Response",
                                    description=as_discord_safe(reply),
                                    color=discord.Color.green()
                                )
                                await message.channel.send(embed=ai_embed, view=ai_view)
                                
                            except Exception as e:
                                log.exception("AI response to voice message failed: %s", e)
                    else:
                        await message.reply("⚠️ نەتوانرا دەنگەکە بگوێزرێتەوە بۆ نووسین.")
                    
                    # Clean up the downloaded file
                    try:
                        os.remove(file_path)
                    except:
                        pass
                        
                except Exception as e:
                    log.exception("Voice message processing failed: %s", e)
                    await message.reply("❌ هەڵەیەک ڕوویدا لە پرۆسێسکردنی دەنگەکەدا.")
    
    # Process regular commands
    await bot.process_commands(message)

# /chat command
@bot.tree.command(name="chat", description="Talk with the Kurdish AI bot")
@app_commands.describe(message="Your message (Kurdish preferred)")
async def chat_command(inter: discord.Interaction, message: str):
    await inter.response.defer(thinking=True)

    try:
        await ai.moderate(message)
    except ModerationFlag as mf:
        await inter.followup.send("⚠️ داواکاریەکە بەهۆی یاسای پاراستن ڕەتکرایەوە.")
        return

    async with openai_sema:  # limit concurrency
        try:
            # Build context and get reply
            hist = await get_history(inter.guild.id if inter.guild else 0, inter.channel.id, inter.user.id)
            reply = await ai.chat(hist, message)
            # Save
            hist.append({"role": "user", "content": message})
            hist.append({"role": "assistant", "content": reply})
            await save_history(inter.guild.id if inter.guild else 0, inter.channel.id, inter.user.id, hist)

            # Send reply with translation and voice buttons
            view = KurdishView(message_content=reply)
            await inter.followup.send(as_discord_safe(reply), view=view)
        except Exception as e:
            log.exception("/chat failed: %s", e)
            await inter.followup.send("❌ هەڵەیەک ڕوویدا. تکایە دواتر هەوڵ بدە.")

# Context menu: Ask AI about a selected message
@bot.tree.context_menu(name="Ask Kurdish AI")
async def ask_ai_context(inter: discord.Interaction, message: discord.Message):
    await inter.response.defer(thinking=True, ephemeral=True)
    content = message.content
    try:
        await ai.moderate(content)
    except ModerationFlag:
        await inter.followup.send("⚠️ نەتوانرا بپرسرێت لەبەر پاراستن.", ephemeral=True)
        return

    async with openai_sema:
        try:
            hist = await get_history(inter.guild.id if inter.guild else 0, inter.channel.id, inter.user.id)
            prompt = f"ئەم پەیامە شرۆڤە بکە و وەڵامێکی بە سود بدە: \n\n{content}"
            reply = await ai.chat(hist, prompt)
            hist.append({"role": "user", "content": prompt})
            hist.append({"role": "assistant", "content": reply})
            await save_history(inter.guild.id if inter.guild else 0, inter.channel.id, inter.user.id, hist)
            # Send reply with translation and voice buttons (ephemeral)
            view = KurdishView(message_content=reply)
            await inter.followup.send(as_discord_safe(reply), view=view, ephemeral=True)
        except Exception as e:
            log.exception("context menu failed: %s", e)
            await inter.followup.send("❌ هەڵەیەک ڕوویدا.", ephemeral=True)

# /clear to reset memory
@bot.tree.command(name="clear", description="Clear your conversation memory with the bot in this channel")
async def clear_command(inter: discord.Interaction):
    await inter.response.defer(ephemeral=True)
    await clear_history(inter.guild.id if inter.guild else 0, inter.channel.id, inter.user.id)
    await inter.followup.send("🧹 مێمۆری گفتوگۆ پاککرایەوە.", ephemeral=True)

# Owner-only eval for quick diagnostics (be careful!)
@bot.tree.command(name="ping", description="Health check")
async def ping(inter: discord.Interaction):
    await inter.response.send_message("🏓 pong")

# Voice commands
@bot.tree.command(name="join", description="Join your voice channel")
async def join_voice(inter: discord.Interaction):
    await inter.response.defer()
    
    if not inter.user.voice or not inter.user.voice.channel:
        await inter.followup.send("⚠️ تکایە یەکەم جار بچۆرە ناو کەناڵی دەنگەوە.")
        return
    
    try:
        channel = inter.user.voice.channel
        await channel.connect()
        await inter.followup.send(f"🔊 بۆت چووە ناو کەناڵی دەنگەوە: {channel.name}")
    except Exception as e:
        log.exception("Voice join failed: %s", e)
        await inter.followup.send("❌ نەتوانرا بچێتە ناو کەناڵی دەنگەوە.")

@bot.tree.command(name="leave", description="Leave voice channel")
async def leave_voice(inter: discord.Interaction):
    await inter.response.defer()
    
    if not inter.guild.voice_client:
        await inter.followup.send("❌ بۆت لە کەناڵی دەنگدا نییە.")
        return
    
    try:
        await inter.guild.voice_client.disconnect()
        await inter.followup.send("👋 بۆت کەناڵی دەنگی بەجێهێشت.")
    except Exception as e:
        log.exception("Voice leave failed: %s", e)
        await inter.followup.send("❌ نەتوانرا کەناڵی دەنگ بەجێبهێڵێت.")

@bot.tree.command(name="speak", description="Speak a message in voice channel")
@app_commands.describe(message="Text to speak in Kurdish")
async def speak_command(inter: discord.Interaction, message: str):
    await inter.response.defer()
    
    if not inter.guild.voice_client:
        await inter.followup.send("❌ بۆت لە کەناڵی دەنگدا نییە. یەکەم `/join` بەکاربهێنە.")
        return
    
    try:
        # Generate TTS
        import time
        filename = f"tts_{int(time.time())}.mp3"
        audio_path = await tts_kurdish(message, filename)
        
        # Play audio
        voice_client = inter.guild.voice_client
        if voice_client.is_playing():
            voice_client.stop()
        
        source = discord.FFmpegPCMAudio(audio_path)
        voice_client.play(source)
        
        await inter.followup.send(f"🗣️ دەنگی کرد: {message[:100]}{'...' if len(message) > 100 else ''}")
        
        # Clean up audio file after playing
        def cleanup(error):
            if error:
                log.error(f"Audio playback error: {error}")
            try:
                os.remove(audio_path)
            except:
                pass
        
        source.cleanup = cleanup
        
    except Exception as e:
        log.exception("TTS command failed: %s", e)
        await inter.followup.send("❌ دەنگکردن سەرکەوتوو نەبوو.")

# Prefix fallback: !chat <text>
@bot.command(name="chat")
async def legacy_chat(ctx: commands.Context, *, message: str):
    async with ctx.typing():
        try:
            await ai.moderate(message)
        except ModerationFlag:
            await ctx.reply("⚠️ ڕێگە پێنەدرا.")
            return
        async with openai_sema:
            hist = await build_history(ctx)
            reply = await ai.chat(hist, message)
            hist.append({"role": "user", "content": message})
            hist.append({"role": "assistant", "content": reply})
            await persist_history(ctx, hist)
            # Send reply with translation and voice buttons
            view = KurdishView(message_content=reply)
            await ctx.reply(as_discord_safe(reply), view=view)

# Streamlined voice commands
@bot.command(name="join")
async def join_voice_legacy(ctx: commands.Context):
    """Bot joins your voice channel"""
    if ctx.author.voice:
        channel = ctx.author.voice.channel
        await channel.connect()
        await ctx.send("🔊 بۆت چووە ناو کەناڵی دەنگەوە!")
    else:
        await ctx.send("❌ دەبێت لە کەناڵی دەنگدا بیت.")

@bot.command(name="leave")
async def leave_voice_legacy(ctx: commands.Context):
    """Bot leaves the voice channel"""
    if ctx.voice_client:
        await ctx.voice_client.disconnect()
        await ctx.send("👋 بۆت کەناڵی دەنگی بەجێهێشت.")
    else:
        await ctx.send("❌ بۆت لە کەناڵی دەنگدا نییە.")

@bot.command(name="talk")
async def talk_sorani(ctx: commands.Context, *, message: str):
    """AI chat with voice response in Sorani"""
    if not ctx.voice_client:
        await ctx.send("❌ بۆت لە کەناڵی دەنگدا نییە. یەکەم `!join` بەکاربهێنە.")
        return
    
    async with ctx.typing():
        try:
            # Moderate input
            await ai.moderate(message)
            
            # Get AI reply in Sorani
            async with openai_sema:
                reply = await ai_reply_sorani(message)
                
                # Generate TTS
                import time
                filename = f"sorani_tts_{int(time.time())}.mp3"
                mp3_path = await tts_sorani(reply, filename)
                
                # Play audio
                if ctx.voice_client.is_playing():
                    ctx.voice_client.stop()
                
                source = discord.FFmpegPCMAudio(mp3_path)
                ctx.voice_client.play(source)
                
                # Send text response with buttons
                view = KurdishView(message_content=reply)
                await ctx.send(f"🗣️ {as_discord_safe(reply)}", view=view)
                
                # Save to conversation history
                hist = await build_history(ctx)
                hist.append({"role": "user", "content": message})
                hist.append({"role": "assistant", "content": reply})
                await persist_history(ctx, hist)
                
                # Clean up audio file after playing
                def cleanup(error):
                    if error:
                        log.error(f"Audio playback error: {error}")
                    try:
                        os.remove(mp3_path)
                    except:
                        pass
                
                source.cleanup = cleanup
                
        except ModerationFlag:
            await ctx.send("⚠️ ڕێگە پێنەدرا.")
        except Exception as e:
            log.exception("Talk command failed: %s", e)
            await ctx.send("❌ هەڵەیەک ڕوویدا لە قسەکردندا.")

# Graceful shutdown
shutdown_event = asyncio.Event()

def _handle_sig(*args):
    log.info("Received shutdown signal")
    shutdown_event.set()

async def main():
    loop = asyncio.get_running_loop()
    for s in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(s, _handle_sig)
        except NotImplementedError:
            pass
    async with bot:
        await bot.start(DISCORD_BOT_TOKEN)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass