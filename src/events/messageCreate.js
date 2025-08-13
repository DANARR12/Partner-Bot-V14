const { ChannelType } = require('discord.js');
const db = require('multiple.db');
const ms = require('ms');
const { partner, link } = require('../../config.json');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;

    // Handle advertisement requests in public channels
    if (message.content === "Reklam" || message.content === "reklam") {
      return message.reply(`رێکلام لە تایبەت بۆم بنێرە`);
    }

    // Handle bot mentions in guild channels
    if (message.channel.type !== ChannelType.DM) {
      if (!message.guild) return;
      
      if (!message.member) {
        try {
          message.member = await message.guild.members.fetch(message.author.id);
        } catch (error) {
          console.error('Failed to fetch member:', error);
          return;
        }
      }

      if (message.content.match(new RegExp(`^<@!?${client.user.id}>`))) {
        return message.channel.send(`**Dm Me For Ads**`);
      }
      return;
    }

    // Handle DM advertisements
    if (message.channel.type === ChannelType.DM) {
      const share = client.channels.cache.get(partner);
      const args = message.content.split(' ');
      const cool = await db.get(`cool_${message.author.id}`);

      if (!share) {
        console.error('Partner channel not found!');
        return;
      }

      // Check cooldown
      if (cool && cool > Date.now()) {
        try {
          await message.author.send({ 
            content: 'ببورن ئەتوانن دووبارە ڕیکلامەکەت بنێرن دوای ١ کاتژمێر' 
          });
        } catch (err) {
          try {
            await message.channel.send({ 
              content: `${message.author} Sorry You Can Send Your Advertisement Again After 1 Hour` 
            });
          } catch (error) {
            console.error('Failed to send cooldown message:', error);
          }
        }
        return;
      }

      const cooldownTime = Date.now() + ms('60m');
      
      try {
        const invite = await client.fetchInvite(args[0]);
        
        // Set cooldown
        await db.set(`cool_${message.author.id}`, cooldownTime);
        
        // Post advertisement
        await share.send({ 
          content: `${invite}\n**📨 Posted By** ${message.author}` 
        });
        
        // Confirm to user
        try {
          await message.channel.send({ 
            content: `> 📪 **Posted In ${share}**\n> 📮 **Post This Link in Your Server To** ${link}` 
          });
        } catch (err) {
          await message.channel.send({ 
            content: `> **${message.author} Your Server Posted in ${share}**` 
          });
        }
        
      } catch (err) {
        console.error('Invalid invite error:', err);
        try {
          await message.channel.send({ 
            content: '> **:x: | Invalid Link Try Again!**' 
          });
        } catch (error) {
          console.error('Failed to send invalid link message:', error);
        }
      }
    }
  },
};