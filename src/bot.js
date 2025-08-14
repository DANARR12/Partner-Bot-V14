require('dotenv/config');
const { Client, Partials, GatewayIntentBits } = require('discord.js');
const db = require('multiple.db');
const { loadEvents } = require('./utils/eventLoader');

// Initialize database
db.useJSON();

// Create Discord client
const client = new Client({ 
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User], 
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

// Load events
loadEvents(client);

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);