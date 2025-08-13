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
        self.responded_users = set()

        confirm_btn = Button(label="✅ Confirm", style=discord.ButtonStyle.green)
        deny_btn = Button(label="❌ Deny", style=discord.ButtonStyle.red)

        async def confirm_callback(interaction: discord.Interaction):
            # Check if user already responded
            if interaction.user.id in self.responded_users:
                await interaction.response.send_message(
                    "You've already responded to this request!", ephemeral=True
                )
                return

            # Check if user is in the target VC
            if interaction.user not in vc.members:
                await interaction.response.send_message(
                    "Only people in the requested VC can confirm.", ephemeral=True
                )
                return

            self.responded_users.add(interaction.user.id)

            try:
                # Check if author is still in a voice channel
                if not author.voice:
                    await interaction.response.send_message(
                        f"{author.mention} is not in a voice channel anymore.", ephemeral=False
                    )
                    return

                # Check if author is already in the target VC
                if author.voice.channel == vc:
                    await interaction.response.send_message(
                        f"{author.mention} is already in {vc.name}!", ephemeral=False
                    )
                    return

                # Move the author to the target VC
                await author.move_to(vc)
                await interaction.response.send_message(
                    f"{author.mention} has been moved to {vc.name}!", ephemeral=False
                )

                # Try to notify the author via DM
                try:
                    embed = discord.Embed(
                        title="✅ Request Approved!",
                        description=f"Your request to join **{vc.name}** has been approved by {interaction.user.mention}",
                        color=discord.Color.green()
                    )
                    await author.send(embed=embed)
                except:
                    pass  # User might have DMs disabled

            except discord.Forbidden:
                await interaction.response.send_message(
                    "I don't have permission to move users!", ephemeral=False
                )
            except Exception as e:
                await interaction.response.send_message(
                    f"An error occurred: {str(e)}", ephemeral=False
                )

        async def deny_callback(interaction: discord.Interaction):
            # Check if user already responded
            if interaction.user.id in self.responded_users:
                await interaction.response.send_message(
                    "You've already responded to this request!", ephemeral=True
                )
                return

            # Check if user is in the target VC
            if interaction.user not in vc.members:
                await interaction.response.send_message(
                    "Only people in the requested VC can deny.", ephemeral=True
                )
                return

            self.responded_users.add(interaction.user.id)

            await interaction.response.send_message(
                f"{author.mention}'s request was denied by {interaction.user.mention}.", ephemeral=False
            )

            # Try to notify the author via DM
            try:
                embed = discord.Embed(
                    title="❌ Request Denied",
                    description=f"Your request to join **{vc.name}** has been denied by {interaction.user.mention}",
                    color=discord.Color.red()
                )
                await author.send(embed=embed)
            except:
                pass  # User might have DMs disabled

        confirm_btn.callback = confirm_callback
        deny_btn.callback = deny_callback

        self.add_item(confirm_btn)
        self.add_item(deny_btn)

class VCSelectionView(View):
    def __init__(self, ctx):
        super().__init__(timeout=60)  # 1 minute timeout
        self.ctx = ctx
        
        # Get voice channels excluding the one the user is currently in
        voice_channels = [vc for vc in ctx.guild.voice_channels if vc != ctx.author.voice.channel]
        
        if not voice_channels:
            # If no other channels, show all channels
            voice_channels = ctx.guild.voice_channels

        for vc in voice_channels:
            button = Button(label=vc.name, style=discord.ButtonStyle.primary)
            button.callback = self.create_button_callback(vc)
            self.add_item(button)

    def create_button_callback(self, vc):
        async def button_callback(interaction: discord.Interaction):
            # Check if the interaction is from the original requester
            if interaction.user != self.ctx.author:
                await interaction.response.send_message(
                    "This request is not for you!", ephemeral=True
                )
                return

            # Check if user is in a voice channel
            if self.ctx.author.voice is None:
                await interaction.response.send_message(
                    "You must be in a voice channel to request to join another one.", ephemeral=True
                )
                return

            # Check if user is already in the target VC
            if self.ctx.author.voice.channel == vc:
                await interaction.response.send_message(
                    f"You're already in {vc.name}!", ephemeral=True
                )
                return

            # Check if target VC has members
            members_in_vc = [m for m in vc.members if not m.bot]
            if not members_in_vc:
                # If no members, allow direct join
                try:
                    await self.ctx.author.move_to(vc)
                    await interaction.response.send_message(
                        f"You have joined {vc.name} (channel was empty)!", ephemeral=True
                    )
                except discord.Forbidden:
                    await interaction.response.send_message(
                        "I don't have permission to move you to that channel!", ephemeral=True
                    )
                except Exception as e:
                    await interaction.response.send_message(
                        f"An error occurred: {str(e)}", ephemeral=True
                    )
                return

            # Create embed for the request
            embed = discord.Embed(
                title="🎤 Voice Channel Join Request",
                description=f"{self.ctx.author.mention} wants to join **{vc.name}**\n\nMembers of {vc.name}, please confirm:",
                color=discord.Color.blue()
            )
            embed.add_field(
                name="Current Channel", 
                value=self.ctx.author.voice.channel.name, 
                inline=True
            )
            embed.add_field(
                name="Members in Target", 
                value=f"{len(members_in_vc)} member(s)", 
                inline=True
            )
            embed.set_footer(text=f"Requested by {self.ctx.author.display_name}")

            await interaction.response.send_message(
                embed=embed,
                view=VCRequestView(self.ctx.author, vc)
            )

        return button_callback

@bot.command()
async def requestvc(ctx):
    """Request to join a voice channel with member approval"""
    
    # Check if user is in a voice channel
    if ctx.author.voice is None:
        embed = discord.Embed(
            title="❌ Error",
            description="You must be in a voice channel to request to join another one.",
            color=discord.Color.red()
        )
        await ctx.send(embed=embed)
        return

    # Check if there are other voice channels
    other_channels = [vc for vc in ctx.guild.voice_channels if vc != ctx.author.voice.channel]
    if not other_channels:
        embed = discord.Embed(
            title="❌ No Available Channels",
            description="No other voice channels found to request joining!",
            color=discord.Color.red()
        )
        await ctx.send(embed=embed)
        return

    # Create selection view
    view = VCSelectionView(ctx)
    
    embed = discord.Embed(
        title="🎤 Voice Channel Request",
        description="Select the voice channel you want to request to join:",
        color=discord.Color.blue()
    )
    embed.set_footer(text="Click a button below to send a request")

    await ctx.send(embed=embed, view=view)

@bot.event
async def on_ready():
    print(f'{bot.user} has connected to Discord!')
    print(f'Bot is in {len(bot.guilds)} guild(s)')

@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandNotFound):
        return  # Ignore command not found errors
    
    embed = discord.Embed(
        title="❌ Error",
        description=f"An error occurred: {str(error)}",
        color=discord.Color.red()
    )
    await ctx.send(embed=embed)

# Get bot token from environment variable
TOKEN = os.getenv('DISCORD_TOKEN')
if not TOKEN:
    print("Error: DISCORD_TOKEN environment variable not set!")
    print("Please create a .env file with your bot token:")
    print("DISCORD_TOKEN=your_bot_token_here")
    exit(1)

if __name__ == "__main__":
    bot.run(TOKEN)