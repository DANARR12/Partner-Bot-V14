const { ActivityType } = require('discord.js');
const logger = require('../utils/logger');

module.exports = async (client) => {
  try {
    logger.info(`${client.user.tag} is now online!`);
    
    // Set bot activity
    client.user.setActivity(`Wednesday`, { type: ActivityType.Watching });
    logger.info('Bot activity set successfully');
    
    // Log guild count
    logger.info(`Connected to ${client.guilds.cache.size} guilds`);
    
    // Log user count
    const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    logger.info(`Serving ${totalUsers} users`);
    
  } catch (error) {
    logger.error('Error in ready event:', error);
  }
};