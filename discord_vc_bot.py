import discord
from discord.ext import commands
from discord.ui import Button, View
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True
intents.members = True
intents.voice_states = True

bot = commands.Bot(command_prefix="!", intents=intents)

class VCRequestView(View):
    def __init__(self, ctx, vc_channels):
        super().__init__(timeout=60)  # 60 second timeout
        self.ctx = ctx
        self.vc_channels = vc_channels
        self.setup_buttons()
    
    def setup_buttons(self):
        for vc in self.vc_channels:
            button = Button(label=vc.name, style=discord.ButtonStyle.primary)
            button.callback = self.create_button_callback(vc)
            self.add_item(button)
    
    def create_button_callback(self, vc):
        async def button_callback(interaction):
            if interaction.user.id != self.ctx.author.id:
                await interaction.response.send_message("This request is not for you!", ephemeral=True)
                return
            
            await self.handle_vc_request(interaction, vc)
        
        return button_callback
    
    async def handle_vc_request(self, interaction, vc):
        # Check if user is in a voice channel
        if not self.ctx.author.voice:
            await interaction.response.send_message("You need to be in a voice channel to request to join another one!", ephemeral=True)
            return
        
        # Check if user is already in the target VC
        if self.ctx.author.voice.channel == vc:
            await interaction.response.send_message("You are already in this voice channel!", ephemeral=True)
            return
        
        # Create confirmation view for VC members
        confirm_view = VCConfirmView(self.ctx, vc)
        
        # Send confirmation message to VC members
        members = [m for m in vc.members if not m.bot]
        if not members:
            # If no members in VC, allow direct join
            try:
                await self.ctx.author.move_to(vc)
                await interaction.response.send_message(f"You have joined {vc.name}!", ephemeral=True)
            except discord.Forbidden:
                await interaction.response.send_message("I don't have permission to move you to that channel!", ephemeral=True)
            except Exception as e:
                await interaction.response.send_message(f"An error occurred: {str(e)}", ephemeral=True)
            return
        
        # Send confirmation requests to members
        sent_count = 0
        for member in members:
            try:
                embed = discord.Embed(
                    title="Voice Channel Join Request",
                    description=f"{self.ctx.author.mention} wants to join {vc.name}",
                    color=discord.Color.blue()
                )
                embed.add_field(name="Requester", value=self.ctx.author.display_name, inline=True)
                embed.add_field(name="Current Channel", value=self.ctx.author.voice.channel.name, inline=True)
                
                await member.send(embed=embed, view=confirm_view)
                sent_count += 1
            except discord.Forbidden:
                # User has DMs disabled
                continue
            except Exception as e:
                print(f"Error sending DM to {member.name}: {e}")
                continue
        
        if sent_count > 0:
            await interaction.response.send_message(
                f"Request sent to {sent_count} member(s) in {vc.name}. Waiting for approval...", 
                ephemeral=True
            )
        else:
            await interaction.response.send_message(
                "Could not send requests to any members in that channel. They may have DMs disabled.", 
                ephemeral=True
            )

class VCConfirmView(View):
    def __init__(self, requester_ctx, target_vc):
        super().__init__(timeout=300)  # 5 minute timeout
        self.requester_ctx = requester_ctx
        self.target_vc = target_vc
        self.setup_buttons()
    
    def setup_buttons(self):
        yes_btn = Button(label="✅ Allow", style=discord.ButtonStyle.green)
        no_btn = Button(label="❌ Deny", style=discord.ButtonStyle.red)
        
        yes_btn.callback = self.yes_callback
        no_btn.callback = self.no_callback
        
        self.add_item(yes_btn)
        self.add_item(no_btn)
    
    async def yes_callback(self, interaction):
        try:
            # Check if requester is still in a voice channel
            if not self.requester_ctx.author.voice:
                await interaction.response.send_message("The requester is no longer in a voice channel.", ephemeral=True)
                return
            
            # Move requester to target VC
            await self.requester_ctx.author.move_to(self.target_vc)
            
            # Notify the approver
            await interaction.response.send_message(
                f"You allowed {self.requester_ctx.author.mention} to join {self.target_vc.name}!", 
                ephemeral=True
            )
            
            # Try to notify the requester
            try:
                await self.requester_ctx.author.send(f"Your request to join {self.target_vc.name} was approved!")
            except:
                pass  # User might have DMs disabled
                
        except discord.Forbidden:
            await interaction.response.send_message("I don't have permission to move users to that channel.", ephemeral=True)
        except Exception as e:
            await interaction.response.send_message(f"An error occurred: {str(e)}", ephemeral=True)
    
    async def no_callback(self, interaction):
        await interaction.response.send_message("You denied the join request.", ephemeral=True)
        
        # Try to notify the requester
        try:
            await self.requester_ctx.author.send(f"Your request to join {self.target_vc.name} was denied.")
        except:
            pass  # User might have DMs disabled

@bot.command()
async def request_vc(ctx):
    """Request to join a voice channel. Members in the target channel will be asked for permission."""
    # Check if user is in a voice channel
    if not ctx.author.voice:
        await ctx.send("You need to be in a voice channel to use this command!")
        return
    
    # List available voice channels
    vc_channels = [vc for vc in ctx.guild.voice_channels if vc != ctx.author.voice.channel]
    
    if not vc_channels:
        await ctx.send("No other voice channels found!")
        return
    
    # Create view with buttons for each VC
    view = VCRequestView(ctx, vc_channels)
    
    embed = discord.Embed(
        title="Voice Channel Join Request",
        description="Select the voice channel you want to request to join:",
        color=discord.Color.blue()
    )
    
    for vc in vc_channels:
        member_count = len([m for m in vc.members if not m.bot])
        embed.add_field(
            name=vc.name, 
            value=f"{member_count} member(s)", 
            inline=True
        )
    
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