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

// Bot ready event
client.once('ready', async () => {
  console.log(`${client.user.tag} is now online!`);
  client.user.setActivity(`Wednesday`, { type: ActivityType.Watching });
});

// All Copyright By </SmSm>#8700
////////

// Advertisement keyword responses
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  const adKeywords = {
    "Reklam": "رێکلام لە تایبەت بۆم بنێرە",
    "reklam": "رێکلام لە تایبەت بۆم بنێرە"
  };

  if (adKeywords[message.content]) {
    message.reply(adKeywords[message.content]);
  }
});

// Bot mention handler
client.on("messageCreate", async message => {
  if (message.channel.type === ChannelType.DM) return;
  if (message.author.bot) return;
  if (!message.guild) return;
  
  if (!message.member) {
    try {
      message.member = await message.guild.members.fetch(message.author.id);
    } catch (error) {
      console.error('Error fetching member:', error);
      return;
    }
  }

  if (message.content.match(new RegExp(`^<@!?${client.user.id}>`))) {
    return message.channel.send(`**Dm Me For Ads**`);
  }
});

// Advertisement posting system
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  if (message.channel.type === ChannelType.DM) {
    try {
      let share = client.channels.cache.get(partner);
      let args = message.content.split(' ');
      let cool = await db.get(`cool_${message.author.id}`);

      if (!share) {
        console.error('Partner channel not found');
        return;
      }

      if (cool && cool > Date.now()) {
        return await message.author.send({
          content: 'ببورن ئەتوانن دووبارە ڕێکلامەکەت بنێرن دوای 5خولەک'
        }).catch(async (err) => {
          await message.channel.send({
            content: `${message.author} Sorry You Can Send Your Advertisement Again After 5m`
          });
        }).catch(err => console.error('Error sending cooldown message:', err));
      }

      let time = Date.now() + ms('60m');
      
      await client.fetchInvite(args[0]).then(async (invite) => {
        await db.set(`cool_${message.author.id}`, time);
        await share.send({
          content: `${invite}\n **📨 Posted By** ${message.author}`
        });
        
        await message.channel.send({
          content: `> 📪 **Posted In ${share}**\n> 📮 **Post This Link in Your Server To** ${link}`
        }).catch(async (err) => {
          await message.channel.send({
            content: `> **${message.author} Your Server Posted in ${share}**`
          });
        });
      }).catch(async (err) => {
        console.error('Invalid invite error:', err);
        await message.channel.send({
          content: '> **:x: |  Invalid Link Try Again!**'
        });
      });
    } catch (err) {
      console.error('Error in advertisement posting:', err);
    }
  }
});

// Voice channel connection
client.on("ready", async () => {
  try {
    const { joinVoiceChannel } = require('@discordjs/voice');

    const channel = await client.channels.fetch(idvc);
    if (channel && channel.isVoiceBased()) {
      console.log(`${client.user.tag} Connected To Voice`);
      
      const VoiceConnection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: true,
        selfMute: true
      });
    } else {
      console.error('Voice channel not found or not a voice channel');
    }
  } catch (err) {
    console.error('Error connecting to voice channel:', err);
  }
});

// ZERO DEVELOPERS
client.login(process.env.DISCORD_TOKEN);
