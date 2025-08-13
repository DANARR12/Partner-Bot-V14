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
        
        # Create buttons for each VC
        for vc in vc_channels:
            button = Button(label=vc.name, style=discord.ButtonStyle.primary)
            button.callback = self.create_button_callback(vc)
            self.add_item(button)
    
    def create_button_callback(self, vc):
        async def button_callback(interaction):
            if interaction.user != self.ctx.author:
                await interaction.response.send_message("This request is not for you!", ephemeral=True)
                return
            
            # Check if user is already in a VC
            if not self.ctx.author.voice:
                await interaction.response.send_message("You need to be in a voice channel first!", ephemeral=True)
                return
            
            # Check if user is already in the target VC
            if self.ctx.author.voice.channel == vc:
                await interaction.response.send_message("You're already in this voice channel!", ephemeral=True)
                return
            
            # Create confirmation view for VC members
            confirm_view = VCConfirmView(self.ctx, vc)
            
            # Send confirmation message to VC members
            members = [m for m in vc.members if not m.bot]
            if not members:
                await interaction.response.send_message("No members in that voice channel to ask for permission!", ephemeral=True)
                return
            
            sent_count = 0
            for member in members:
                try:
                    embed = discord.Embed(
                        title="Voice Channel Join Request",
                        description=f"{self.ctx.author.mention} wants to join **{vc.name}**\n\nDo you approve?",
                        color=discord.Color.blue()
                    )
                    embed.set_footer(text=f"Requested by {self.ctx.author.display_name}")
                    
                    await member.send(embed=embed, view=confirm_view)
                    sent_count += 1
                except discord.Forbidden:
                    # User has DMs disabled
                    continue
                except Exception as e:
                    print(f"Error sending DM to {member}: {e}")
                    continue
            
            if sent_count > 0:
                await interaction.response.send_message(
                    f"Request sent to {sent_count} member(s) in {vc.name}! Waiting for approval...", 
                    ephemeral=True
                )
            else:
                await interaction.response.send_message(
                    "Could not send requests to any members in that voice channel!", 
                    ephemeral=True
                )
        
        return button_callback

class VCConfirmView(View):
    def __init__(self, requester_ctx, target_vc):
        super().__init__(timeout=300)  # 5 minute timeout
        self.requester_ctx = requester_ctx
        self.target_vc = target_vc
        self.responded_users = set()
    
    @discord.ui.button(label="✅ Approve", style=discord.ButtonStyle.green)
    async def approve_button(self, interaction: discord.Interaction, button: Button):
        if interaction.user.id in self.responded_users:
            await interaction.response.send_message("You've already responded to this request!", ephemeral=True)
            return
        
        self.responded_users.add(interaction.user.id)
        
        try:
            # Check if requester is still in a VC
            if not self.requester_ctx.author.voice:
                await interaction.response.send_message("The requester is no longer in a voice channel!", ephemeral=True)
                return
            
            # Move requester to target VC
            await self.requester_ctx.author.move_to(self.target_vc)
            
            # Send success messages
            await interaction.response.send_message(
                f"Approved! {self.requester_ctx.author.mention} has been moved to {self.target_vc.name}.", 
                ephemeral=True
            )
            
            # Try to notify the requester
            try:
                embed = discord.Embed(
                    title="Request Approved! ✅",
                    description=f"Your request to join **{self.target_vc.name}** has been approved by {interaction.user.mention}",
                    color=discord.Color.green()
                )
                await self.requester_ctx.author.send(embed=embed)
            except:
                pass  # User might have DMs disabled
            
        except discord.Forbidden:
            await interaction.response.send_message("I don't have permission to move users!", ephemeral=True)
        except Exception as e:
            await interaction.response.send_message(f"An error occurred: {str(e)}", ephemeral=True)
    
    @discord.ui.button(label="❌ Deny", style=discord.ButtonStyle.red)
    async def deny_button(self, interaction: discord.Interaction, button: Button):
        if interaction.user.id in self.responded_users:
            await interaction.response.send_message("You've already responded to this request!", ephemeral=True)
            return
        
        self.responded_users.add(interaction.user.id)
        
        await interaction.response.send_message(
            f"Denied! {self.requester_ctx.author.mention}'s request to join {self.target_vc.name}.", 
            ephemeral=True
        )
        
        # Try to notify the requester
        try:
            embed = discord.Embed(
                title="Request Denied ❌",
                description=f"Your request to join **{self.target_vc.name}** has been denied by {interaction.user.mention}",
                color=discord.Color.red()
            )
            await self.requester_ctx.author.send(embed=embed)
        except:
            pass  # User might have DMs disabled

@bot.command()
async def request_vc(ctx):
    """Request to join a voice channel with member approval"""
    # Check if user is in a VC
    if not ctx.author.voice:
        embed = discord.Embed(
            title="❌ Error",
            description="You need to be in a voice channel first to request joining another channel!",
            color=discord.Color.red()
        )
        await ctx.send(embed=embed)
        return
    
    # List available voice channels (excluding the one they're currently in)
    vc_channels = [vc for vc in ctx.guild.voice_channels if vc != ctx.author.voice.channel]
    
    if not vc_channels:
        embed = discord.Embed(
            title="❌ No Available Channels",
            description="No other voice channels found to request joining!",
            color=discord.Color.red()
        )
        await ctx.send(embed=embed)
        return
    
    # Create view with buttons
    view = VCRequestView(ctx, vc_channels)
    
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