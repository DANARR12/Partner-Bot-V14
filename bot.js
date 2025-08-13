require('dotenv').config();
const { Client, Partials, ChannelType, ActivityType, GatewayIntentBits } = require('discord.js');
require('@discordjs/voice');
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

const db = require('multiple.db');
db.useJSON();
const ms = require('ms');
const { partner, link, idvc } = require('./config.json');

client.once('ready', async () => {
  console.log(`${client.user.tag} is now online!`);
  client.user.setActivity(`Wednesday`, { type: ActivityType.Watching });
});

// Handle advertisement requests in public channels
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content === "Reklam" || message.content === "reklam") {
    message.reply(`رێکلام لە تایبەت بۆم بنێرە`);
  }
});

// Handle bot mentions
client.on("messageCreate", async message => {
  if (message.channel.type === ChannelType.DM) return;
  if (message.author.bot) return;
  if (!message.guild) return;
  
  if (!message.member) {
    try {
      message.member = await message.guild.members.fetch(message.author.id);
    } catch (error) {
      console.error('Failed to fetch member:', error);
      return;
    }
  }

  if (message.content.match(new RegExp(`^<@!?${client.user.id}>`))) {
    return message.channel.send(`**Dm Me For Ads**`);
  }
});

// Handle DM advertisements
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.type !== ChannelType.DM) return;
  
  const share = client.channels.cache.get(partner);
  const args = message.content.split(' ');
  const cool = await db.get(`cool_${message.author.id}`);

  if (!share) {
    console.error('Partner channel not found!');
    return;
  }

  // Check cooldown
  if (cool && cool > Date.now()) {
    try {
      await message.author.send({ 
        content: 'ببورن ئەتوانن دووبارە ڕیکلامەکەت بنێرن دوای ١ کاتژمێر' 
      });
    } catch (err) {
      try {
        await message.channel.send({ 
          content: `${message.author} Sorry You Can Send Your Advertisement Again After 1 Hour` 
        });
      } catch (error) {
        console.error('Failed to send cooldown message:', error);
      }
    }
    return;
  }

  const cooldownTime = Date.now() + ms('60m');
  
  try {
    const invite = await client.fetchInvite(args[0]);
    
    // Set cooldown
    await db.set(`cool_${message.author.id}`, cooldownTime);
    
    // Post advertisement
    await share.send({ 
      content: `${invite}\n**📨 Posted By** ${message.author}` 
    });
    
    // Confirm to user
    try {
      await message.channel.send({ 
        content: `> 📪 **Posted In ${share}**\n> 📮 **Post This Link in Your Server To** ${link}` 
      });
    } catch (err) {
      await message.channel.send({ 
        content: `> **${message.author} Your Server Posted in ${share}**` 
      });
    }
    
  } catch (err) {
    console.error('Invalid invite error:', err);
    try {
      await message.channel.send({ 
        content: '> **:x: | Invalid Link Try Again!**' 
      });
    } catch (error) {
      console.error('Failed to send invalid link message:', error);
    }
  }
});

// Auto-join voice channel on ready
client.on("ready", async () => {
  try {
    const { joinVoiceChannel } = require('@discordjs/voice');
    
    const channel = await client.channels.fetch(idvc);
    if (!channel) {
      console.error('Voice channel not found!');
      return;
    }
    
    console.log(`${client.user.tag} Connected To Voice Channel`);
    
    const voiceConnection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true
    });
    
  } catch (err) {
    console.error('Failed to join voice channel:', err);
  }
});

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

client.login(process.env.DISCORD_TOKEN);
