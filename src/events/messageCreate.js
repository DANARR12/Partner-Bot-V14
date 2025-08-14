const { ChannelType } = require('discord.js');
const ms = require('ms');
const config = require('../config/config');
const database = require('../utils/database');
const logger = require('../utils/logger');

class MessageHandler {
  constructor() {
    this.config = config.get();
  }

  // Handle advertisement requests in public channels
  handleAdRequest = (message) => {
    if (message.author.bot) return;
    if (message.channel.type === ChannelType.DM) return;

    const content = message.content.toLowerCase();
    if (content === "reklam") {
      message.reply(`رێکلام لە تایبەت بۆم بنێرە`)
        .catch(error => logger.error('Failed to reply to ad request:', error));
      logger.info(`Ad request from ${message.author.tag} in ${message.guild.name}`);
    }
  }

  // Handle bot mentions
  handleMentions = async (message) => {
    if (message.channel.type === ChannelType.DM) return;
    if (message.author.bot) return;
    if (!message.guild) return;
    
    // Fetch member if not available
    if (!message.member) {
      try {
        message.member = await message.guild.members.fetch(message.author.id);
      } catch (error) {
        logger.error('Failed to fetch member:', error);
        return;
      }
    }

    // Check if bot was mentioned
    if (message.content.match(new RegExp(`^<@!?${message.client.user.id}>`))) {
      message.channel.send(`**Dm Me For Ads**`)
        .catch(error => logger.error('Failed to reply to mention:', error));
      logger.info(`Bot mentioned by ${message.author.tag} in ${message.guild.name}`);
    }
  }

  // Handle DM advertisements
  handleDMAdvertisements = async (message) => {
    if (message.author.bot) return;
    if (message.channel.type !== ChannelType.DM) return;
    
    try {
      const share = message.client.channels.cache.get(this.config.partner);
      if (!share) {
        logger.error('Partner channel not found in cache, attempting to fetch...');
        try {
          const fetchedChannel = await message.client.channels.fetch(this.config.partner);
          if (!fetchedChannel) {
            logger.error('Partner channel not found!');
            return;
          }
        } catch (error) {
          logger.error('Failed to fetch partner channel:', error);
          return;
        }
      }

      const args = message.content.split(' ');
      const cooldownKey = `cool_${message.author.id}`;
      const cool = await database.get(cooldownKey);

      // Check cooldown
      if (cool && cool > Date.now()) {
        const remainingTime = ms(cool - Date.now(), { long: true });
        
        try {
          await message.author.send({ 
            content: `ببورن ئەتوانن دووبارە ڕیکلامەکەت بنێرن دوای ١ کاتژمێر\nRemaining time: ${remainingTime}` 
          });
        } catch (err) {
          try {
            await message.channel.send({ 
              content: `${message.author} Sorry You Can Send Your Advertisement Again After 1 Hour\nRemaining time: ${remainingTime}` 
            });
          } catch (error) {
            logger.error('Failed to send cooldown message:', error);
          }
        }
        
        logger.info(`Cooldown active for ${message.author.tag}, remaining: ${remainingTime}`);
        return;
      }

      // Validate invite link
      if (!args[0] || !args[0].includes('discord.gg/') && !args[0].includes('discord.com/invite/')) {
        await message.channel.send({ 
          content: '> **:x: | Please provide a valid Discord invite link!**' 
        }).catch(error => logger.error('Failed to send invalid format message:', error));
        return;
      }

      const cooldownTime = Date.now() + ms('60m');
      
      try {
        const invite = await message.client.fetchInvite(args[0]);
        
        if (!invite.guild) {
          throw new Error('Invalid guild invite');
        }
        
        // Set cooldown
        await database.set(cooldownKey, cooldownTime);
        
        // Post advertisement
        await share.send({ 
          content: `${invite}\n**📨 Posted By** ${message.author}\n**🏰 Server:** ${invite.guild.name}\n**👥 Members:** ${invite.memberCount || 'Unknown'}` 
        });
        
        // Confirm to user
        try {
          await message.channel.send({ 
            content: `> 📪 **Posted In** <#${this.config.partner}>\n> 📮 **Post This Link in Your Server To** ${this.config.link}\n> ⏰ **Next advertisement in:** 1 hour` 
          });
        } catch (err) {
          await message.channel.send({ 
            content: `> **${message.author} Your Server Posted Successfully**` 
          });
        }
        
        logger.info(`Advertisement posted by ${message.author.tag} for server: ${invite.guild.name}`);
        
      } catch (err) {
        logger.error('Invalid invite error:', err);
        
        try {
          await message.channel.send({ 
            content: '> **:x: | Invalid Discord Invite Link! Please make sure:**\n> • The link is valid and not expired\n> • The link leads to a Discord server\n> • You have permission to create invites' 
          });
        } catch (error) {
          logger.error('Failed to send invalid link message:', error);
        }
      }
      
    } catch (error) {
      logger.error('Error in DM advertisement handler:', error);
    }
  }
}

module.exports = new MessageHandler();