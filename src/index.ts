import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import { registerLockdownCommand, registerAntiRaidCommand } from './commands/lockdown.js';
import { attachGuildMemberAdd } from './handlers/guildMemberAdd.js';
import { attachMessageCreate } from './handlers/messageCreate.js';
import { attachAuditLogWatchers } from './handlers/auditLog.js';
import { AntiRaid } from './core/antiRaid.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,   // required for join events
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // for content checks (links/mentions)
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildModeration
  ],
  partials: [Partials.Channel]
});

// simple command registry
(client as any).commands = new Collection();

const antiRaid = new AntiRaid(client);
(client as any).antiRaidInstance = antiRaid;
registerLockdownCommand(client, antiRaid);
registerAntiRaidCommand(client, antiRaid);

attachGuildMemberAdd(client, antiRaid);
attachMessageCreate(client, antiRaid);
attachAuditLogWatchers(client, antiRaid);

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.login(process.env.DISCORD_TOKEN);