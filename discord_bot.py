import discord
from discord import app_commands
import openai
from gtts import gTTS
from discord import FFmpegPCMAudio
import os
from collections import defaultdict
from langdetect import detect
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ===== CONFIG =====
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL = "gpt-4o-mini"
# ==================

# Validate required environment variables
if not DISCORD_TOKEN:
    raise ValueError("DISCORD_TOKEN environment variable is required")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is required")

# Initialize OpenAI client
client_openai = openai.OpenAI(api_key=OPENAI_API_KEY)

intents = discord.Intents.default()
intents.message_content = True
intents.voice_states = True
client = discord.Client(intents=intents)
tree = app_commands.CommandTree(client)

# Store conversation per user
user_history = defaultdict(list)

# Store voice clients to prevent multiple connections
voice_clients = {}

async def speak_in_voice(voice_channel, text, lang):
    """Speak text in a voice channel using TTS"""
    if voice_channel is None:
        return
    
    try:
        # Create TTS audio
        tts = gTTS(text=text, lang=lang)
        audio_file = f"response_{voice_channel.id}.mp3"
        tts.save(audio_file)
        
        # Connect to voice channel if not already connected
        if voice_channel.id not in voice_clients or not voice_clients[voice_channel.id].is_connected():
            voice_client = await voice_channel.connect()
            voice_clients[voice_channel.id] = voice_client
        else:
            voice_client = voice_clients[voice_channel.id]
        
        # Play audio
        voice_client.play(FFmpegPCMAudio(audio_file), after=lambda e: print(f"Audio finished: {e}"))
        
        # Wait for audio to finish
        while voice_client.is_playing():
            await discord.utils.sleep_until(1)
        
        # Clean up audio file
        if os.path.exists(audio_file):
            os.remove(audio_file)
            
    except Exception as e:
        print(f"Error in TTS: {e}")
        # Clean up audio file on error
        if os.path.exists(audio_file):
            os.remove(audio_file)

@client.event
async def on_ready():
    print(f'Logged in as {client.user}')
    try:
        await tree.sync()
        print("Commands synced successfully")
    except Exception as e:
        print(f"Error syncing commands: {e}")

@tree.command(name="ask", description="پرسە لە یارمەتیدەرەوە / Ask the assistant")
async def ask(interaction: discord.Interaction, question: str):
    await interaction.response.defer()

    try:
        # Detect language (ku or en)
        try:
            user_lang = detect(question)
            if user_lang not in ["ku", "en"]:
                user_lang = "ku"  # default to Kurdish
        except:
            user_lang = "ku"

        tts_lang = "ku" if user_lang == "ku" else "en"

        # Set system prompt to force AI language
        system_prompt = "تۆ یارمەتیدەرێکی زمانەکان بەدەست هێنەرە. وەڵامەکان بە زمانی کوردی بدە." if user_lang == "ku" else "You are a helpful assistant. Answer in English."

        # Add user message to conversation history
        user_history[interaction.user.id].append({"role": "user", "content": question})

        # Limit conversation history to prevent token overflow
        if len(user_history[interaction.user.id]) > 20:
            user_history[interaction.user.id] = user_history[interaction.user.id][-20:]

        # Get AI response using updated API
        response = client_openai.chat.completions.create(
            model=MODEL,
            messages=[{"role": "system", "content": system_prompt}] + user_history[interaction.user.id]
        )
        answer = response.choices[0].message.content

        # Save assistant response to history
        user_history[interaction.user.id].append({"role": "assistant", "content": answer})

        # Send text reply
        await interaction.followup.send(answer)

        # Voice reply if user is in a voice channel
        if interaction.user.voice:
            voice_channel = interaction.user.voice.channel
            await speak_in_voice(voice_channel, answer, tts_lang)
            
    except Exception as e:
        error_message = f"Error: {str(e)}"
        await interaction.followup.send(error_message)
        print(f"Error in ask command: {e}")

@tree.command(name="clear", description="Clear conversation history")
async def clear_history(interaction: discord.Interaction):
    user_history[interaction.user.id].clear()
    await interaction.response.send_message("Conversation history cleared!")

@tree.command(name="join", description="Join voice channel")
async def join_voice(interaction: discord.Interaction):
    if not interaction.user.voice:
        await interaction.response.send_message("You need to be in a voice channel first!")
        return
    
    voice_channel = interaction.user.voice.channel
    try:
        voice_client = await voice_channel.connect()
        voice_clients[voice_channel.id] = voice_client
        await interaction.response.send_message(f"Joined {voice_channel.name}")
    except Exception as e:
        await interaction.response.send_message(f"Failed to join voice channel: {e}")

@tree.command(name="leave", description="Leave voice channel")
async def leave_voice(interaction: discord.Interaction):
    if not interaction.user.voice:
        await interaction.response.send_message("You're not in a voice channel!")
        return
    
    voice_channel = interaction.user.voice.channel
    if voice_channel.id in voice_clients and voice_clients[voice_channel.id].is_connected():
        await voice_clients[voice_channel.id].disconnect()
        del voice_clients[voice_channel.id]
        await interaction.response.send_message(f"Left {voice_channel.name}")
    else:
        await interaction.response.send_message("Not connected to this voice channel")

# Clean up voice clients when bot shuts down
@client.event
async def on_disconnect():
    for voice_client in voice_clients.values():
        if voice_client.is_connected():
            await voice_client.disconnect()

if __name__ == "__main__":
    client.run(DISCORD_TOKEN)