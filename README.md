# Discord Prayer Times Bot 🕌

A Discord bot that provides prayer times for Kurdish cities using the Aladhan API.

## Features

- Get prayer times for 5 Kurdish cities (Soran, Hawler, Kirkuk, Chamchamal, Sulaymaniyah)
- Support for Kurdish language labels
- Server-specific default city settings
- Beautiful Discord embeds with prayer time information

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Create a Discord Bot:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to the "Bot" section and create a bot
   - Copy the bot token

3. **Configure the bot:**
   - Open `prayer_bot.py`
   - Replace `"YOUR_DISCORD_BOT_TOKEN_HERE"` with your actual bot token

4. **Invite the bot to your server:**
   - Go to OAuth2 > URL Generator in the Developer Portal
   - Select "bot" scope
   - Select permissions: Send Messages, Embed Links, Use Slash Commands
   - Use the generated URL to invite the bot

5. **Run the bot:**
   ```bash
   python prayer_bot.py
   ```

## Commands

- `!setup <city>` - Set the default city for the server
- `!prayer <city>` - Get prayer times for a specific city
- `!prayer` - Get prayer times for the server's default city

## Available Cities

- **Soran** (سۆران)
- **Hawler** (هەولێر) 
- **Kirkuk** (کرکوک)
- **Chamchamal** (چەمچەماڵ)
- **Sulaymaniyah** (سلێمانی)

## Prayer Times

The bot displays the following prayer times in Kurdish:
- **Fajr** (فه‌جڕ) - Dawn
- **Sunrise** (خۆره‌وه‌ربوون) - Sunrise
- **Dhuhr** (نیوەڕۆ) - Noon
- **Asr** (ئەسڕ) - Afternoon
- **Maghrib** (ئێواران) - Sunset
- **Isha** (عیشا) - Night

## API

Uses the [Aladhan API](https://aladhan.com/prayer-times-api) with:
- Method: Muslim World League (3)
- School: Shafi'i (0)

## Notes

- Server defaults are stored in memory (resets when bot restarts)
- For production use, consider using a database to persist server settings
- The bot uses the current date for prayer times
