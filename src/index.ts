import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from './config.js';
import { AntiRaid } from './core/antiRaid.js';
import { handleGuildMemberAdd, setAntiRaidInstance as setMemberAddInstance } from './handlers/guildMemberAdd.js';
import { handleMessageCreate, setAntiRaidInstance as setMessageCreateInstance } from './handlers/messageCreate.js';
import { handleAuditLog } from './handlers/auditLog.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration
  ]
});

// Initialize anti-raid system
const antiRaid = new AntiRaid(client);

// Set global instance for handlers
(global as any).antiRaidInstance = antiRaid;

// Set instances for handlers
setMemberAddInstance(antiRaid);
setMessageCreateInstance(antiRaid);

// Command collection
client.commands = new Collection();

client.once('ready', () => {
  console.log(`🚀 ${client.user?.tag} is ready!`);
  console.log(`📊 Monitoring ${client.guilds.cache.size} guilds`);
  console.log(`🛡️ Anti-raid system initialized`);
});

// Event handlers
client.on('guildMemberAdd', handleGuildMemberAdd);
client.on('messageCreate', handleMessageCreate);
client.on('guildAuditLogEntryCreate', handleAuditLog);

// Error handling
client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Login
client.login(config.discord.token);