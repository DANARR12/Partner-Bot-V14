import { Client, Message } from 'discord.js';
import { AntiRaid } from '../core/antiRaid.js';

export function attachMessageCreate(client: Client, antiRaid: AntiRaid): void {
  client.on('messageCreate', async (message: Message) => {
    try {
      // Ignore bot messages and DMs
      if (message.author.bot || !message.guild) {
        return;
      }

      // Check for spam patterns
      if (isSpamMessage(message)) {
        console.log(`🚨 Potential spam detected from ${message.author.tag}: ${message.content}`);
        
        await antiRaid.handleMessageSpam(message.guild, message.author.id);
      }

      // Check for raid keywords
      if (containsRaidKeywords(message.content)) {
        console.log(`⚠️  Raid keywords detected from ${message.author.tag}: ${message.content}`);
        
        // Log for monitoring
        const logChannel = message.guild.channels.cache.find(
          channel => channel.type === 0 && channel.name.includes('mod-log')
        );
        
        if (logChannel && logChannel.type === 0) {
          await logChannel.send({
            embeds: [{
              color: 0xffa500,
              title: '⚠️ Raid Keywords Detected',
              description: `User: ${message.author.tag}\nChannel: ${message.channel}\nContent: ${message.content}`,
              timestamp: new Date().toISOString()
            }]
          });
        }
      }

    } catch (error) {
      console.error('Error handling message create:', error);
    }
  });
}

function isSpamMessage(message: Message): boolean {
  const content = message.content.toLowerCase();
  
  // Check for repeated characters
  const repeatedChars = /(.)\1{4,}/;
  if (repeatedChars.test(content)) {
    return true;
  }

  // Check for repeated words
  const words = content.split(' ');
  const wordCount = new Map<string, number>();
  
  for (const word of words) {
    if (word.length > 2) { // Ignore short words
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
      if (wordCount.get(word)! > 3) {
        return true;
      }
    }
  }

  // Check for all caps
  if (content.length > 10 && content === content.toUpperCase()) {
    return true;
  }

  return false;
}

function containsRaidKeywords(content: string): boolean {
  const raidKeywords = [
    'raid', 'spam', 'nuke', 'crash', 'destroy', 'hack', 'exploit',
    'ddos', 'attack', 'bomb', 'kill', 'die', 'suicide', 'self-harm'
  ];

  const lowerContent = content.toLowerCase();
  return raidKeywords.some(keyword => lowerContent.includes(keyword));
}