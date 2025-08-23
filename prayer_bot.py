import discord
from discord.ext import commands
import requests
from datetime import date

# ==== CONFIG ====
TOKEN = "YOUR_DISCORD_BOT_TOKEN_HERE"

ALADHAN_BASE = "https://api.aladhan.com/v1/timings"
DEFAULT_PARAMS = {"method": 3, "school": 0}  # 3=Muslim World League, 0=Shafi'i

CITIES = {
    "Soran":        {"name_ku": "سۆران",      "lat": 36.653, "lng": 44.537},
    "Hawler":       {"name_ku": "هەولێر",     "lat": 36.191, "lng": 44.009},
    "Kirkuk":       {"name_ku": "کرکوک",      "lat": 35.467, "lng": 44.392},
    "Chamchamal":   {"name_ku": "چەمچەماڵ",  "lat": 35.536, "lng": 44.826},
    "Sulaymaniyah": {"name_ku": "سلێمانی",   "lat": 35.561, "lng": 45.435},
}

PRAYER_LABELS_KU = {
    "Fajr": "فه‌جڕ",
    "Sunrise": "خۆره‌وه‌ربوون",
    "Dhuhr": "نیوەڕۆ",
    "Asr": "ئەسڕ",
    "Maghrib": "ئێواران",
    "Isha": "عیشا",
}

PRIMARY_KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"]

# ==== MEMORY FOR SERVER DEFAULTS ====
# (In production, better to use a database or file, but here we'll keep it simple in RAM)
server_defaults = {}

# ==== FUNCTIONS ====
def get_prayer_times(lat, lng):
    params = dict(DEFAULT_PARAMS)
    params["latitude"] = lat
    params["longitude"] = lng
    params["date"] = date.today().strftime("%d-%m-%Y")

    try:
        res = requests.get(ALADHAN_BASE, params=params, timeout=15)
        data = res.json()
    except Exception as e:
        return None, f"⚠️ API Error: {e}"

    if res.status_code == 200 and data.get("code") == 200:
        timings = data["data"]["timings"]
        tz = data["data"]["meta"]["timezone"]
        return {"timings": timings, "timezone": tz}, None
    else:
        return None, "⚠️ Couldn't fetch prayer times."

def format_timings(timings):
    lines = []
    for key in PRIMARY_KEYS:
        if key in timings:
            label = PRAYER_LABELS_KU.get(key, key)
            lines.append(f"**{label}** → {timings[key]}")
    return "\n".join(lines)

# ==== DISCORD BOT ====
intents = discord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"✅ Logged in as {bot.user}")

@bot.command()
async def setup(ctx, city: str = None):
    """Set the default city for this server. Example: !setup Sulaymaniyah"""
    if not city:
        await ctx.send("➡️ Please provide a city. Example: `!setup Sulaymaniyah`")
        return

    city_key = None
    for c in CITIES:
        if c.lower() == city.lower():
            city_key = c
            break

    if not city_key:
        await ctx.send("⚠️ Unknown city. Available: " + ", ".join(CITIES.keys()))
        return

    server_defaults[ctx.guild.id] = city_key
    await ctx.send(f"✅ Default city set to **{CITIES[city_key]['name_ku']} ({city_key})** for this server!")

@bot.command()
async def prayer(ctx, city: str = None):
    """Get prayer times. Example: !prayer Sulaymaniyah or just !prayer"""
    if not city:
        # use server default if set
        city_key = server_defaults.get(ctx.guild.id)
        if not city_key:
            await ctx.send("⚠️ No default city set. Use `!setup <city>` or `!prayer <city>`.")
            return
    else:
        city_key = None
        for c in CITIES:
            if c.lower() == city.lower():
                city_key = c
                break
        if not city_key:
            await ctx.send("⚠️ Unknown city. Available: " + ", ".join(CITIES.keys()))
            return

    meta = CITIES[city_key]
    info, err = get_prayer_times(meta["lat"], meta["lng"])

    if err:
        await ctx.send(err)
        return

    embed = discord.Embed(
        title=f"🕌 کاتەکانی نوێژ - {meta['name_ku']} ({city_key})",
        description=format_timings(info["timings"]),
        color=0x2ecc71
    )
    embed.set_footer(text=f"Timezone: {info['timezone']}")
    await ctx.send(embed=embed)

# ==== RUN BOT ====
bot.run(TOKEN)