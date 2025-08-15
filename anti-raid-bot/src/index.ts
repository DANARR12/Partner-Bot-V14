import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildModeration
  ]
});

client.once('ready', () => {
  console.log(`🚀 Anti-raid bot logged in as ${client.user?.tag}`);
  console.log(`📊 Monitoring ${client.guilds.cache.size} guilds`);
});

client.on('guildMemberAdd', (member) => {
  console.log(`👤 Member joined: ${member.user.tag} in ${member.guild.name}`);
});

client.login(process.env.DISCORD_TOKEN);
