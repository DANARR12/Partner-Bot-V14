import discord
from discord.ext import commands
from discord.ui import Button, View
import os
import asyncio
from typing import List, Optional

# ====== CONFIG ======
TOKEN = os.getenv("DISCORD_TOKEN")
if not TOKEN:
    print("❌ DISCORD_TOKEN environment variable not set!")
    print("🔧 Please set your Discord bot token as an environment variable:")
    print("   export DISCORD_TOKEN='your_bot_token_here'")
    exit(1)

# ====== BOT SETUP ======
intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True
intents.members = True
intents.voice_states = True

bot = commands.Bot(command_prefix="!", intents=intents)

# ====== CLASSES ======
class VCConfirmationView(View):
    """View for confirming VC join requests"""
    
    def __init__(self, requester: discord.Member, target_vc: discord.VoiceChannel):
        super().__init__(timeout=300)  # 5 minute timeout
        self.requester = requester
        self.target_vc = target_vc
        self.confirmed = False
        
    @discord.ui.button(label="✅ Allow", style=discord.ButtonStyle.green)
    async def confirm_button(self, interaction: discord.Interaction, button: Button):
        """Handle confirmation of VC join request"""
        try:
            # Check if requester is still in a voice channel
            if not self.requester.voice:
                await interaction.response.send_message(
                    f"❌ {self.requester.mention} is no longer in a voice channel!",
                    ephemeral=True
                )
                return
                
            # Check if target VC still exists and bot has permissions
            if not self.target_vc or not self.target_vc.permissions_for(self.target_vc.guild.me).move_members:
                await interaction.response.send_message(
                    "❌ I don't have permission to move members to that voice channel!",
                    ephemeral=True
                )
                return
                
            # Move the requester
            await self.requester.move_to(self.target_vc)
            await interaction.response.send_message(
                f"✅ {self.requester.mention} has been moved to **{self.target_vc.name}**!",
                ephemeral=True
            )
            self.confirmed = True
            
            # Disable all buttons
            for item in self.children:
                item.disabled = True
            await interaction.edit_original_response(view=self)
            
        except discord.HTTPException as e:
            await interaction.response.send_message(
                f"❌ Failed to move {self.requester.mention}: {str(e)}",
                ephemeral=True
            )
        except Exception as e:
            await interaction.response.send_message(
                f"❌ An unexpected error occurred: {str(e)}",
                ephemeral=True
            )
    
    @discord.ui.button(label="❌ Deny", style=discord.ButtonStyle.red)
    async def deny_button(self, interaction: discord.Interaction, button: Button):
        """Handle denial of VC join request"""
        await interaction.response.send_message(
            f"❌ Request from {self.requester.mention} has been denied.",
            ephemeral=True
        )
        
        # Disable all buttons
        for item in self.children:
            item.disabled = True
        await interaction.edit_original_response(view=self)
    
    async def on_timeout(self):
        """Handle view timeout"""
        # Disable all buttons when timeout occurs
        for item in self.children:
            item.disabled = True
        
        # Try to edit the message to show it expired
        try:
            await self.message.edit(content="⏰ This request has expired.", view=self)
        except:
            pass  # Message might be deleted or unreachable

class VCSelectionView(View):
    """View for selecting which VC to request to join"""
    
    def __init__(self, requester: discord.Member, voice_channels: List[discord.VoiceChannel]):
        super().__init__(timeout=60)  # 1 minute timeout
        self.requester = requester
        
        # Add buttons for each voice channel (up to 25 buttons max)
        for i, vc in enumerate(voice_channels[:25]):
            button = Button(
                label=f"{vc.name} ({len(vc.members)} members)",
                style=discord.ButtonStyle.primary,
                custom_id=f"vc_{vc.id}"
            )
            button.callback = self.create_vc_callback(vc)
            self.add_item(button)
    
    def create_vc_callback(self, vc: discord.VoiceChannel):
        """Create a callback function for a specific VC button"""
        async def vc_callback(interaction: discord.Interaction):
            await self.handle_vc_selection(interaction, vc)
        return vc_callback
    
    async def handle_vc_selection(self, interaction: discord.Interaction, selected_vc: discord.VoiceChannel):
        """Handle voice channel selection"""
        try:
            # Check if requester is in a voice channel
            if not self.requester.voice:
                await interaction.response.send_message(
                    "❌ You must be in a voice channel to request to join another one!",
                    ephemeral=True
                )
                return
            
            # Check if requester is already in the target VC
            if self.requester.voice.channel == selected_vc:
                await interaction.response.send_message(
                    f"❌ You're already in **{selected_vc.name}**!",
                    ephemeral=True
                )
                return
            
            # Get members in the target VC (excluding bots)
            vc_members = [member for member in selected_vc.members if not member.bot]
            
            if not vc_members:
                await interaction.response.send_message(
                    f"❌ No members found in **{selected_vc.name}** to approve your request!",
                    ephemeral=True
                )
                return
            
            # Create confirmation view
            confirm_view = VCConfirmationView(self.requester, selected_vc)
            
            # Send DMs to VC members
            successful_dms = 0
            for member in vc_members:
                try:
                    dm_embed = discord.Embed(
                        title="🎤 Voice Channel Join Request",
                        description=f"**{self.requester.display_name}** wants to join **{selected_vc.name}**",
                        color=0x00ff88
                    )
                    dm_embed.set_thumbnail(url=self.requester.display_avatar.url)
                    dm_embed.add_field(
                        name="Current Channel", 
                        value=self.requester.voice.channel.name if self.requester.voice else "None",
                        inline=True
                    )
                    dm_embed.add_field(
                        name="Requested Channel", 
                        value=selected_vc.name,
                        inline=True
                    )
                    
                    dm_message = await member.send(embed=dm_embed, view=confirm_view)
                    confirm_view.message = dm_message  # Store reference for timeout handling
                    successful_dms += 1
                except discord.Forbidden:
                    # User has DMs disabled
                    continue
                except Exception:
                    # Other error sending DM
                    continue
            
            if successful_dms == 0:
                await interaction.response.send_message(
                    f"❌ Couldn't send messages to any members in **{selected_vc.name}**. They may have DMs disabled.",
                    ephemeral=True
                )
            else:
                await interaction.response.send_message(
                    f"✅ Request sent to {successful_dms} member(s) in **{selected_vc.name}**!",
                    ephemeral=True
                )
            
            # Disable all buttons in this view
            for item in self.children:
                item.disabled = True
            await interaction.edit_original_response(view=self)
            
        except Exception as e:
            await interaction.response.send_message(
                f"❌ An error occurred: {str(e)}",
                ephemeral=True
            )
    
    async def on_timeout(self):
        """Handle view timeout"""
        for item in self.children:
            item.disabled = True

# ====== COMMANDS ======
@bot.command(name="request_vc", aliases=["requestvc", "join_vc", "joinvc"])
async def request_vc(ctx):
    """Request to join a voice channel"""
    try:
        # Check if user is in a voice channel
        if not ctx.author.voice:
            await ctx.send("❌ You must be in a voice channel to use this command!")
            return
        
        # Check bot permissions
        if not ctx.guild.me.guild_permissions.move_members:
            await ctx.send("❌ I don't have permission to move members in this server!")
            return
        
        # Get available voice channels
        voice_channels = [vc for vc in ctx.guild.voice_channels if vc != ctx.author.voice.channel]
        
        if not voice_channels:
            await ctx.send("❌ No other voice channels found in this server!")
            return
        
        # Create embed for the selection message
        embed = discord.Embed(
            title="🎤 Voice Channel Request",
            description=f"**{ctx.author.display_name}**, select which voice channel you'd like to request to join:",
            color=0x00ff88
        )
        embed.add_field(
            name="Current Channel", 
            value=ctx.author.voice.channel.name,
            inline=True
        )
        embed.set_footer(text="This request will expire in 1 minute")
        
        # Create view with VC selection buttons
        view = VCSelectionView(ctx.author, voice_channels)
        
        await ctx.send(embed=embed, view=view)
        
    except Exception as e:
        await ctx.send(f"❌ An error occurred: {str(e)}")

@bot.event
async def on_ready():
    """Event triggered when bot is ready"""
    print(f"✅ {bot.user} is now online!")
    print(f"📊 Connected to {len(bot.guilds)} guild(s)")
    print(f"🎤 Voice Channel Request Bot is ready!")

@bot.event
async def on_command_error(ctx, error):
    """Handle command errors"""
    if isinstance(error, commands.CommandNotFound):
        return  # Ignore command not found errors
    elif isinstance(error, commands.MissingPermissions):
        await ctx.send("❌ You don't have permission to use this command!")
    elif isinstance(error, commands.BotMissingPermissions):
        await ctx.send("❌ I don't have the required permissions to execute this command!")
    else:
        await ctx.send(f"❌ An error occurred: {str(error)}")
        print(f"Command error: {error}")

# ====== HELP COMMAND ======
@bot.command(name="help_vc", aliases=["vchelp"])
async def help_vc(ctx):
    """Show help for voice channel commands"""
    embed = discord.Embed(
        title="🎤 Voice Channel Request Bot - Help",
        description="This bot helps you request to join voice channels!",
        color=0x00ff88
    )
    
    embed.add_field(
        name="Commands",
        value=(
            "`!request_vc` - Request to join a different voice channel\n"
            "`!help_vc` - Show this help message"
        ),
        inline=False
    )
    
    embed.add_field(
        name="How it works",
        value=(
            "1. Use `!request_vc` while in a voice channel\n"
            "2. Select which channel you want to join\n"
            "3. Members in that channel will get a DM with approve/deny buttons\n"
            "4. If approved, you'll be moved to their channel!"
        ),
        inline=False
    )
    
    embed.add_field(
        name="Requirements",
        value=(
            "• You must be in a voice channel to make a request\n"
            "• Target channel must have non-bot members\n"
            "• Members must have DMs enabled to receive requests"
        ),
        inline=False
    )
    
    embed.set_footer(text="Requests expire after 5 minutes")
    
    await ctx.send(embed=embed)

if __name__ == "__main__":
    print("🚀 Starting Voice Channel Request Bot...")
    print("🔧 Make sure DISCORD_TOKEN environment variable is set!")
    bot.run(TOKEN)