require('dotenv').config();
const { Client, Partials, ChannelType, ActivityType, GatewayIntentBits } = require('discord.js');
require('@discordjs/voice');

// Import modules
const config = require('./config/config');
const database = require('./utils/database');
const logger = require('./utils/logger');

// Create Discord client
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

// Import event handlers
const readyHandler = require('./events/ready');
const messageHandler = require('./events/messageCreate');
const voiceHandler = require('./events/voiceReady');

// Register event handlers
client.once('ready', readyHandler);
client.on('messageCreate', messageHandler.handleAdRequest);
client.on('messageCreate', messageHandler.handleMentions);
client.on('messageCreate', messageHandler.handleDMAdvertisements);
client.on('ready', voiceHandler);

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN)
  .then(() => {
    logger.info('Successfully logged in to Discord');
  })
  .catch((error) => {
    logger.error('Failed to login to Discord:', error);
    process.exit(1);
  });