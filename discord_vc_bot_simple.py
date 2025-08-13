import discord
from discord.ext import commands
from discord.ui import View, Button
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

intents = discord.Intents.default()
intents.message_content = True
intents.voice_states = True
intents.guilds = True
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)

class VCRequestView(View):
    def __init__(self, author, vc):
        super().__init__(timeout=300)  # 5 minute timeout
        self.author = author
        self.vc = vc
        self.setup_buttons()

    def setup_buttons(self):
        confirm_btn = Button(label="✅ Confirm", style=discord.ButtonStyle.green)
        deny_btn = Button(label="❌ Deny", style=discord.ButtonStyle.red)

        confirm_btn.callback = self.confirm_callback
        deny_btn.callback = self.deny_callback

        self.add_item(confirm_btn)
        self.add_item(deny_btn)

    async def confirm_callback(self, interaction: discord.Interaction):
        if interaction.user in self.vc.members:  # Only VC members can approve
            try:
                if self.author.voice:
                    await self.author.move_to(self.vc)
                    await interaction.response.send_message(
                        f"{self.author.mention} has been moved to {self.vc.name}!", ephemeral=False
                    )
                else:
                    await interaction.response.send_message(
                        f"{self.author.mention} is not in a voice channel anymore.", ephemeral=False
                    )
            except discord.Forbidden:
                await interaction.response.send_message(
                    "I don't have permission to move users to that channel.", ephemeral=True
                )
            except Exception as e:
                await interaction.response.send_message(
                    f"An error occurred: {str(e)}", ephemeral=True
                )
            self.stop()
        else:
            await interaction.response.send_message(
                "Only people in the requested VC can confirm.", ephemeral=True
            )

    async def deny_callback(self, interaction: discord.Interaction):
        if interaction.user in self.vc.members:
            await interaction.response.send_message(
                f"{self.author.mention}'s request was denied.", ephemeral=False
            )
            self.stop()
        else:
            await interaction.response.send_message(
                "Only people in the requested VC can deny.", ephemeral=True
            )

class VCSelectionView(View):
    def __init__(self, ctx, voice_channels):
        super().__init__(timeout=60)  # 1 minute timeout
        self.ctx = ctx
        self.voice_channels = voice_channels
        self.setup_buttons()

    def setup_buttons(self):
        for vc in self.voice_channels:
            button = Button(label=vc.name, style=discord.ButtonStyle.primary)
            button.callback = self.create_button_callback(vc)
            self.add_item(button)

    def create_button_callback(self, vc):
        async def button_callback(interaction: discord.Interaction):
            if interaction.user.id != self.ctx.author.id:
                await interaction.response.send_message(
                    "This request is not for you!", ephemeral=True
                )
                return

            if self.ctx.author.voice is None:
                await interaction.response.send_message(
                    "You must be in a voice channel to request to join another one.", ephemeral=True
                )
                return

            if self.ctx.author.voice.channel == vc:
                await interaction.response.send_message(
                    "You are already in this voice channel!", ephemeral=True
                )
                return

            # Check if target VC is empty
            if not [m for m in vc.members if not m.bot]:
                try:
                    await self.ctx.author.move_to(vc)
                    await interaction.response.send_message(
                        f"You have joined {vc.name}!", ephemeral=True
                    )
                except discord.Forbidden:
                    await interaction.response.send_message(
                        "I don't have permission to move you to that channel.", ephemeral=True
                    )
                except Exception as e:
                    await interaction.response.send_message(
                        f"An error occurred: {str(e)}", ephemeral=True
                    )
                return

            await interaction.response.send_message(
                f"{self.ctx.author.mention} wants to join **{vc.name}**. Members of {vc.name}, please confirm:",
                view=VCRequestView(self.ctx.author, vc)
            )

        return button_callback

@bot.command()
async def requestvc(ctx):
    """Request to join a voice channel. Members in the target channel will be asked for permission."""
    voice_channels = [vc for vc in ctx.guild.voice_channels if vc != ctx.author.voice.channel] if ctx.author.voice else ctx.guild.voice_channels
    
    if not voice_channels:
        await ctx.send("No other voice channels found.")
        return

    embed = discord.Embed(
        title="Voice Channel Join Request",
        description="Select the voice channel you want to request to join:",
        color=discord.Color.blue()
    )
    
    for vc in voice_channels:
        member_count = len([m for m in vc.members if not m.bot])
        embed.add_field(
            name=vc.name, 
            value=f"{member_count} member(s)", 
            inline=True
        )

    view = VCSelectionView(ctx, voice_channels)
    await ctx.send(embed=embed, view=view)

@bot.event
async def on_ready():
    print(f'{bot.user} has connected to Discord!')
    print(f'Bot is in {len(bot.guilds)} guild(s)')

# Get bot token from environment variable
TOKEN = os.getenv('DISCORD_TOKEN')
if not TOKEN:
    print("Error: DISCORD_TOKEN environment variable not set!")
    print("Please create a .env file with your bot token:")
    print("DISCORD_TOKEN=your_bot_token_here")
    exit(1)

bot.run(TOKEN)