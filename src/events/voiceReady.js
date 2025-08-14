const { joinVoiceChannel } = require('@discordjs/voice');
const config = require('../config/config');
const logger = require('../utils/logger');

module.exports = async (client) => {
  try {
    const { idvc } = config.get();
    
    const channel = await client.channels.fetch(idvc);
    if (!channel) {
      logger.error('Voice channel not found!');
      return;
    }
    
    if (!channel.isVoiceBased()) {
      logger.error('Specified channel is not a voice channel!');
      return;
    }
    
    logger.info(`${client.user.tag} attempting to connect to voice channel: ${channel.name}`);
    
    const voiceConnection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true
    });
    
    logger.info(`${client.user.tag} successfully connected to voice channel`);
    
    // Handle voice connection events
    voiceConnection.on('stateChange', (oldState, newState) => {
      logger.debug(`Voice connection state changed: ${oldState.status} -> ${newState.status}`);
    });
    
    voiceConnection.on('error', (error) => {
      logger.error('Voice connection error:', error);
    });
    
  } catch (error) {
    logger.error('Failed to join voice channel:', error);
  }
};