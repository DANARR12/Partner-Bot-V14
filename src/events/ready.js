const { ActivityType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { idvc } = require('../../config.json');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`${client.user.tag} is now online!`);
    client.user.setActivity(`Wednesday`, { type: ActivityType.Watching });

    // Auto-join voice channel
    try {
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
  },
};