import { Client, GuildMember } from 'discord.js';
import { AntiRaid } from '../core/antiRaid.js';

export function attachGuildMemberAdd(client: Client, antiRaid: AntiRaid): void {
  client.on('guildMemberAdd', async (member: GuildMember) => {
    try {
      console.log(`👤 Member joined: ${member.user.tag} in ${member.guild.name}`);
      
      await antiRaid.handleMemberJoin(member.guild, member);

      // Log suspicious accounts
      const accountAge = Date.now() - member.user.createdTimestamp;
      const daysOld = Math.floor(accountAge / (24 * 60 * 60 * 1000));
      
      if (daysOld < 7) {
        console.log(`⚠️  New account joined: ${member.user.tag} (${daysOld} days old)`);
      }

    } catch (error) {
      console.error('Error handling guild member add:', error);
    }
  });
}