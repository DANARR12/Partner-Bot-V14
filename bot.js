require('dotenv').config();
const { Client, Partials, ChannelType, ActivityType, GatewayIntentBits } = require('discord.js');
require('@discordjs/voice');
const { joinVoiceChannel } = require('@discordjs/voice');
const db = require('multiple.db');
const ms = require('ms');
const { partner, link, idvc } = require('./config.json');

// Initialize database - multiple.db doesn't need useJSON() call

// Create Discord client with proper intents
const client = new Client({
    partials: [
        Partials.Channel,
        Partials.Messages,
        Partials.GuildMembers,
        Partials.DirectMessages
    ],
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

// Bot ready event
client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} is now online!`);
    client.user.setActivity('Wednesday', { type: ActivityType.Watching });
    
    // Connect to voice channel
    await connectToVoiceChannel();
});

// Connect to voice channel function
async function connectToVoiceChannel() {
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
        
        console.log(`🎵 ${client.user.tag} connected to voice channel: ${channel.name}`);
    } catch (error) {
        console.error('❌ Error connecting to voice channel:', error);
    }
}

// Handle advertisement requests in guild channels
client.on("messageCreate", (message) => {
    if (message.author.bot || message.channel.type === ChannelType.DM) return;
    
    const content = message.content.toLowerCase();
    
    if (content === "reklam" || content === "رێکلام") {
        message.reply('رێکلام لە تایبەت بۆم بنێرە');
    }
});

// Handle bot mentions
client.on("messageCreate", async (message) => {
    if (message.channel.type === ChannelType.DM) return;
    if (message.author.bot) return;
    if (!message.guild) return;
    
    if (!message.member) {
        message.member = await message.guild.fetchMember(message.author.id);
    }

    if (message.content.match(new RegExp(`^<@!?${client.user.id}>`))) {
        return message.channel.send('**Dm Me For Ads**');
    }
});

// Handle advertisement submissions in DMs
client.on('messageCreate', async (message) => {
    if (message.author.bot || message.channel.type !== ChannelType.DM) return;
    
    const share = client.channels.cache.get(partner);
    if (!share) {
        console.log('❌ Partner channel not found');
        return;
    }
    
    // Check cooldown
    const cool = await db.get(`cool_${message.author.id}`);
    if (cool && cool > Date.now()) {
        const remainingTime = Math.ceil((cool - Date.now()) / (1000 * 60));
        const cooldownMessage = `ببورن ئەتوانن دووبارە ڕیکلامەکەت بنێرن دوای ${remainingTime} خولەک`;
        
        try {
            await message.author.send({ content: cooldownMessage });
        } catch (error) {
            console.log('Could not send DM to user:', error);
        }
        return;
    }
    
    // Process advertisement
    try {
        const args = message.content.split(' ');
        const invite = await client.fetchInvite(args[0]);
        
        if (!invite) {
            await message.channel.send({ content: '> **:x: | Invalid Link Try Again!**' });
            return;
        }
        
        // Set cooldown (60 minutes)
        const cooldownTime = Date.now() + ms('60m');
        await db.set(`cool_${message.author.id}`, cooldownTime);
        
        // Send advertisement to partner channel
        await share.send({
            content: `${invite}\n**📨 Posted By** ${message.author}`
        });
        
        // Confirm to user
        const successMessage = `> 📪 **Posted In ${share}**\n> 📮 **Post This Link in Your Server To** ${link}`;
        await message.channel.send({ content: successMessage });
        
    } catch (error) {
        console.error('Error processing advertisement:', error);
        await message.channel.send({ content: '> **:x: | Invalid Link Try Again!**' });
    }
});

// Error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('❌ Failed to login:', error);
});
