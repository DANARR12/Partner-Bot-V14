require('dotenv').config();
const { Client, Partials, ChannelType, ActivityType, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const client = new Client({ 
    partials: [
        Partials.Channel, 
        Partials.Message, 
        Partials.GuildMember, 
        Partials.User
    ], 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const db = require('multiple.db');
db.useJSON();
const ms = require('ms');

// Load configuration
let config;
try {
    config = require('./config.json');
} catch (error) {
    console.error('❌ Config file not found! Please create config.json');
    process.exit(1);
}

const { partner, link, idvc } = config;

// Bot ready event
client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} is now online!`);
    client.user.setActivity(`Wednesday`, { type: ActivityType.Watching });
    
    // Connect to voice channel
    await connectToVoiceChannel();
});

// Voice channel connection function
async function connectToVoiceChannel() {
    if (!idvc) {
        console.log('⚠️ No voice channel ID provided in config');
        return;
    }
    
    try {
        const channel = await client.channels.fetch(idvc);
        if (!channel) {
            console.log('❌ Voice channel not found');
            return;
        }
        
        const voiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: true
        });
        
        console.log(`🔊 ${client.user.tag} connected to voice channel: ${channel.name}`);
    } catch (error) {
        console.error('❌ Failed to connect to voice channel:', error.message);
    }
}

// Message event handlers
client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Handle advertisement requests in regular channels
    if (message.channel.type !== ChannelType.DM) {
        await handlePublicMessage(message);
    } else {
        // Handle DM advertisement submissions
        await handleDirectMessage(message);
    }
});

// Handle public channel messages
async function handlePublicMessage(message) {
    // Ensure guild member is fetched
    if (!message.member) {
        try {
            message.member = await message.guild.members.fetch(message.author.id);
        } catch (error) {
            console.error('Failed to fetch member:', error.message);
            return;
        }
    }
    
    // Advertisement request responses
    if (message.content.toLowerCase() === 'reklam' || message.content === 'Reklam') {
        return message.reply('رێکلام لە تایبەت بۆم بنێرە');
    }
    
    // Bot mention response
    if (message.content.match(new RegExp(`^<@!?${client.user.id}>`))) {
        return message.channel.send('**DM Me For Ads**');
    }
}

// Handle direct message advertisement submissions
async function handleDirectMessage(message) {
    const shareChannel = client.channels.cache.get(partner);
    if (!shareChannel) {
        console.error('❌ Partner channel not found');
        return message.channel.send('❌ Advertisement channel is not configured properly.');
    }
    
    const args = message.content.split(' ');
    const inviteLink = args[0];
    
    if (!inviteLink) {
        return message.channel.send('❌ Please provide a Discord server invite link.');
    }
    
    // Check cooldown
    const cooldownKey = `cool_${message.author.id}`;
    const cooldown = await db.get(cooldownKey);
    
    if (cooldown && cooldown > Date.now()) {
        const timeLeft = Math.ceil((cooldown - Date.now()) / 1000 / 60);
        try {
            return await message.author.send({
                content: 'ببورن ئەتوانن دووبارە ڕیکلامەکەت بنێرن دوای 5خولەک'
            });
        } catch (err) {
            try {
                return await message.channel.send({
                    content: `${message.author} Sorry You Can Send Your Advertisement Again After ${timeLeft}m`
                });
            } catch (error) {
                console.error('Failed to send cooldown message:', error);
            }
        }
    }
    
    try {
        // Validate and fetch invite
        const invite = await client.fetchInvite(inviteLink);
        
        // Set cooldown (60 minutes)
        const cooldownTime = Date.now() + ms('60m');
        await db.set(cooldownKey, cooldownTime);
        
        // Post advertisement
        await shareChannel.send({
            content: `${invite}\n **📨 Posted By** ${message.author}`
        });
        
        // Confirm to user
        try {
            await message.channel.send({
                content: `> 📪 **Posted In ${shareChannel}**\n> 📮 **Post This Link in Your Server To** ${link}`
            });
        } catch (err) {
            await message.channel.send({
                content: `> **${message.author} You Server Posted in ${shareChannel}**`
            });
        }
        
    } catch (error) {
        console.error('Invalid invite error:', error);
        try {
            await message.channel.send({
                content: '> **:x: |  Invalid Link Try Again!**'
            });
        } catch (error) {
            console.error('Failed to send invalid link message:', error);
        }
    }
}

// Error handling
client.on('error', (error) => {
    console.error('Discord client error:', error);
});

client.on('warn', (warning) => {
    console.warn('Discord client warning:', warning);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🔄 Shutting down bot...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🔄 Shutting down bot...');
    client.destroy();
    process.exit(0);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN)
    .then(() => {
        console.log('🔑 Successfully logged in to Discord');
    })
    .catch((error) => {
        console.error('❌ Failed to login to Discord:', error.message);
        process.exit(1);
    });