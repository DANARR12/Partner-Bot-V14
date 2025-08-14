require('dotenv').config();
const { Client, Partials, ChannelType, ActivityType, GatewayIntentBits } = require('discord.js');
require('@discordjs/voice');

// Initialize Discord Client
const client = new Client({ 
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.DirectMessage], 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildInvites
  ]
});

// Initialize Database and Utilities
const db = require('multiple.db');
db.useJSON();
const ms = require('ms');

// Load Configuration
const { partner, link, idvc } = require('../config.json');

// ===========================================
// BOT READY EVENT
// ===========================================
client.once('ready', async () => {
  console.log(`🟢 ${client.user.tag} is now online!`);
  
  // Set bot activity status
  client.user.setActivity(`Wednesday`, { type: ActivityType.Watching });
  
  // Auto-join voice channel
  await autoJoinVoiceChannel();
});

// ===========================================
// ADVERTISEMENT HANDLING
// ===========================================

// Handle public advertisement requests
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  // Respond to advertisement requests
  if (message.content === "Reklam" || message.content === "reklam") {
    message.reply(`رێکلام لە تایبەت بۆم بنێرە`);
  }
});

// Handle bot mentions
client.on("messageCreate", async message => {
  if (message.channel.type === ChannelType.DM) return;
  if (message.author.bot) return;
  if (!message.guild) return;
  
  // Ensure member is fetched
  if (!message.member) {
    try {
      message.member = await message.guild.members.fetch(message.author.id);
    } catch (error) {
      console.error('Failed to fetch member:', error);
      return;
    }
  }

  // Respond to bot mentions
  if (message.content.match(new RegExp(`^<@!?${client.user.id}>`))) {
    return message.channel.send(`**Dm Me For Ads**`);
  }
});

// Handle DM advertisements
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.type !== ChannelType.DM) return;
  
  await handleAdvertisementSubmission(message);
});

// ===========================================
// FUNCTIONS
// ===========================================

/**
 * Handle advertisement submission in DMs
 * @param {Message} message - The Discord message object
 */
async function handleAdvertisementSubmission(message) {
  const share = client.channels.cache.get(partner);
  const args = message.content.split(' ');
  const userId = message.author.id;
  const cool = await db.get(`cool_${userId}`);

  // Validate partner channel exists
  if (!share) {
    console.error('❌ Partner channel not found!');
    return await message.channel.send({
      content: '❌ **Error: Advertisement channel not configured properly.**'
    });
  }

  // Check cooldown
  if (cool && cool > Date.now()) {
    const timeLeft = Math.ceil((cool - Date.now()) / 60000); // minutes
    return await sendCooldownMessage(message, timeLeft);
  }

  // Validate and process the invite
  try {
    const invite = await client.fetchInvite(args[0]);
    
    // Set new cooldown (60 minutes)
    const cooldownTime = Date.now() + ms('60m');
    await db.set(`cool_${userId}`, cooldownTime);
    
    // Post advertisement to partner channel
    await share.send({ 
      content: `${invite}\n**📨 Posted By** ${message.author}` 
    });
    
    // Send confirmation to user
    await sendSuccessMessage(message, share);
    
    console.log(`✅ Advertisement posted by ${message.author.tag} (${message.author.id})`);
    
  } catch (err) {
    console.error('❌ Invalid invite error:', err);
    await sendInvalidLinkMessage(message);
  }
}

/**
 * Send cooldown message to user
 * @param {Message} message - The Discord message object
 * @param {number} timeLeft - Time left in minutes
 */
async function sendCooldownMessage(message, timeLeft) {
  try {
    await message.author.send({ 
      content: 'ببورن ئەتوانن دووبارە ڕیکلامەکەت بنێرن دوای 5خولەک' 
    });
  } catch (err) {
    try {
      await message.channel.send({ 
        content: `${message.author} Sorry You Can Send Your Advertisement Again After 5m` 
      });
    } catch (error) {
      console.error('Failed to send cooldown message:', error);
    }
  }
}

/**
 * Send success message to user
 * @param {Message} message - The Discord message object
 * @param {Channel} shareChannel - The partner channel
 */
async function sendSuccessMessage(message, shareChannel) {
  try {
    await message.channel.send({ 
      content: `> 📪 **Posted In ${shareChannel}**\n> 📮 **Post This Link in Your Server To** ${link}` 
    });
  } catch (err) {
    try {
      await message.channel.send({ 
        content: `> **${message.author} Your Server Posted in ${shareChannel}**` 
      });
    } catch (error) {
      console.error('Failed to send success message:', error);
    }
  }
}

/**
 * Send invalid link message to user
 * @param {Message} message - The Discord message object
 */
async function sendInvalidLinkMessage(message) {
  try {
    await message.channel.send({ 
      content: '> **:x: | Invalid Link Try Again!**' 
    });
  } catch (error) {
    console.error('Failed to send invalid link message:', error);
  }
}

/**
 * Auto-join voice channel on bot ready
 */
async function autoJoinVoiceChannel() {
  try {
    const { joinVoiceChannel } = require('@discordjs/voice');
    
    const channel = await client.channels.fetch(idvc);
    if (!channel) {
      console.error('❌ Voice channel not found!');
      return;
    }
    
    console.log(`🔊 ${client.user.tag} Connected To Voice Channel: ${channel.name}`);
    
    const voiceConnection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true
    });
    
    // Handle voice connection errors
    voiceConnection.on('error', (error) => {
      console.error('❌ Voice connection error:', error);
    });
    
  } catch (err) {
    console.error('❌ Failed to join voice channel:', err);
  }
}

// ===========================================
// ERROR HANDLING
// ===========================================

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🔴 Uncaught Exception:', err);
});

// Handle Discord client errors
client.on('error', (error) => {
  console.error('🔴 Discord client error:', error);
});

client.on('warn', (warning) => {
  console.warn('⚠️ Discord client warning:', warning);
});

// ===========================================
// BOT LOGIN
// ===========================================
client.login(process.env.DISCORD_TOKEN);