require('dotenv').config();
const { Client, Partials, ChannelType, ActivityType, GatewayIntentBits } = require('discord.js');
require('@discordjs/voice');
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const session = require('express-session');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3000;

// OAuth Configuration
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || `http://localhost:${PORT}/auth/callback`;

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({ 
    secret: process.env.SESSION_SECRET || 'your-secret-key-here', 
    resave: false, 
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));
// Static files will be served after authentication check

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

// Bot Statistics
let botStats = {
  startTime: Date.now(),
  totalAds: 0,
  voiceConnected: false,
  advertisements: []
};

// ===========================================
// AUTHENTICATION MIDDLEWARE
// ===========================================

function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    
    // Check if user is bot owner or has admin permissions
    const adminUsers = process.env.ADMIN_USERS ? process.env.ADMIN_USERS.split(',') : [];
    const isAdmin = adminUsers.includes(req.session.user.id) || req.session.user.id === process.env.BOT_OWNER_ID;
    
    if (!isAdmin) {
        return res.status(403).send(`
            <h1>Access Denied</h1>
            <p>You don't have permission to access this dashboard.</p>
            <a href="/auth/logout">Logout</a>
        `);
    }
    next();
}

// ===========================================
// AUTHENTICATION ROUTES
// ===========================================

// Login route
app.get('/auth/login', (req, res) => {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
    res.redirect(url);
});

// OAuth callback
app.get('/auth/callback', async (req, res) => {
    const code = req.query.code;
    
    if (!code) {
        return res.status(400).send('Authorization code not found');
    }

    try {
        const data = new URLSearchParams();
        data.append('client_id', CLIENT_ID);
        data.append('client_secret', CLIENT_SECRET);
        data.append('grant_type', 'authorization_code');
        data.append('code', code);
        data.append('redirect_uri', REDIRECT_URI);

        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', data.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
        });

        const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
        });

        req.session.user = {
            ...userResponse.data,
            guilds: guildsResponse.data,
            access_token: tokenResponse.data.access_token
        };

        console.log(`🔐 User authenticated: ${userResponse.data.username}#${userResponse.data.discriminator} (${userResponse.data.id})`);
        res.redirect('/');
        
    } catch (error) {
        console.error('OAuth error:', error.response?.data || error.message);
        res.status(500).send('Authentication failed');
    }
});

// Logout route
app.get('/auth/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

// ===========================================
// WEB SERVER ROUTES
// ===========================================

// Dashboard route (protected)
app.get('/', requireAuth, requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Serve static files only after authentication for dashboard
app.use('/', requireAuth, requireAdmin, express.static(path.join(__dirname, '../public')));

// API: Bot Status (protected)
app.get('/api/status', requireAuth, requireAdmin, (req, res) => {
    const uptime = client.readyAt ? Date.now() - client.readyAt.getTime() : 0;
    
    res.json({
        botOnline: client.isReady(),
        botTag: client.user ? client.user.tag : null,
        guilds: client.guilds.cache.size,
        uptime: uptime,
        voiceConnected: botStats.voiceConnected,
        totalAds: botStats.totalAds,
        authenticatedUser: {
            username: req.session.user.username,
            discriminator: req.session.user.discriminator,
            id: req.session.user.id,
            avatar: req.session.user.avatar
        }
    });
});

// API: Recent Advertisements (protected)
app.get('/api/recent-ads', requireAuth, requireAdmin, (req, res) => {
    const recentAds = botStats.advertisements.slice(-50);
    res.json(recentAds);
});

// API: User Info (protected)
app.get('/api/user', requireAuth, (req, res) => {
    res.json({
        username: req.session.user.username,
        discriminator: req.session.user.discriminator,
        id: req.session.user.id,
        avatar: req.session.user.avatar,
        guilds: req.session.user.guilds?.length || 0
    });
});

// API: Clear advertisements (protected, admin only)
app.delete('/api/clear-ads', requireAuth, requireAdmin, (req, res) => {
    botStats.advertisements = [];
    botStats.totalAds = 0;
    console.log(`🗑️ Advertisements cleared by ${req.session.user.username}#${req.session.user.discriminator}`);
    res.json({ message: 'Advertisements cleared' });
});

// ===========================================
// BOT READY EVENT
// ===========================================
client.once('ready', async () => {
    console.log(`🟢 ${client.user.tag} is now online!`);
    console.log(`🌐 Dashboard available at: http://localhost:${PORT}`);
    console.log(`🔐 OAuth Client ID: ${CLIENT_ID}`);
    
    // Set bot activity status
    client.user.setActivity(`Secure Dashboard: localhost:${PORT}`, { type: ActivityType.Playing });
    
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
        return message.channel.send(`**Dm Me For Ads** | Secure Dashboard: http://localhost:${PORT}`);
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
        
        // Log advertisement for dashboard
        const adData = {
            user: message.author.tag,
            userId: message.author.id,
            server: invite.guild ? invite.guild.name : 'Unknown Server',
            inviteCode: invite.code,
            timestamp: new Date().toISOString()
        };
        
        botStats.advertisements.push(adData);
        botStats.totalAds++;
        
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
            content: `> 📪 **Posted In ${shareChannel}**\n> 📮 **Post This Link in Your Server To** ${link}\n> 🔐 **Secure Dashboard:** http://localhost:${PORT}` 
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
            botStats.voiceConnected = false;
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
        
        botStats.voiceConnected = true;
        
        // Handle voice connection events
        voiceConnection.on('error', (error) => {
            console.error('❌ Voice connection error:', error);
            botStats.voiceConnected = false;
        });
        
        voiceConnection.on('disconnected', () => {
            console.log('🔇 Voice connection disconnected');
            botStats.voiceConnected = false;
        });
        
    } catch (err) {
        console.error('❌ Failed to join voice channel:', err);
        botStats.voiceConnected = false;
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
// START SERVERS
// ===========================================

// Start web server
app.listen(PORT, () => {
    console.log(`🌐 Secure web dashboard server started on port ${PORT}`);
    console.log(`📊 Dashboard URL: http://localhost:${PORT}`);
    console.log(`🔐 Login URL: http://localhost:${PORT}/auth/login`);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);