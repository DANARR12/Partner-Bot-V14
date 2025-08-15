import { Client, SlashCommandBuilder, PermissionFlagsBits, GuildMember, TextChannel } from 'discord.js';
import { AntiRaidConfig } from '../config.js';
import { AntiRaid } from '../core/antiRaid.js';

export function registerLockdownCommand(client: Client, antiRaid: AntiRaid): void {
  const data = new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Enable or disable server lockdown')
    .addSubcommand(subcommand =>
      subcommand
        .setName('enable')
        .setDescription('Enable server lockdown')
        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription('Reason for lockdown')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('disable')
        .setDescription('Disable server lockdown')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

  client.commands.set('lockdown', { data, execute });
}

export async function execute(interaction: any): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
    return;
  }

  const member = interaction.member as GuildMember;
  if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply({ content: 'You need Manage Server permission to use this command!', ephemeral: true });
    return;
  }

  const subcommand = interaction.options.getSubcommand();

  try {
    if (subcommand === 'enable') {
      await enableLockdown(interaction);
    } else if (subcommand === 'disable') {
      await disableLockdown(interaction);
    }
  } catch (error) {
    console.error('Error executing lockdown command:', error);
    await interaction.reply({ 
      content: 'An error occurred while executing the lockdown command.', 
      ephemeral: true 
    });
  }
}

async function enableLockdown(interaction: any): Promise<void> {
  const reason = interaction.options.getString('reason') || 'Manual lockdown enabled';
  const guild = interaction.guild;

  // Disable @everyone from sending messages
  const everyoneRole = guild.roles.everyone;
  await everyoneRole.setPermissions(everyoneRole.permissions.remove(PermissionFlagsBits.SendMessages));

  // Disable @everyone from connecting to voice channels
  await everyoneRole.setPermissions(everyoneRole.permissions.remove(PermissionFlagsBits.Connect));

  // Set verification level to highest
  await guild.setVerificationLevel(4); // VERY_HIGH

  // Notify all channels
  const textChannels = guild.channels.cache.filter(channel => channel.type === 0);
  for (const [, channel] of textChannels) {
    if (channel.type === 0) {
      try {
        await channel.send({
          embeds: [{
            color: 0xff0000,
            title: '🔒 Server Lockdown Enabled',
            description: `This server is now in lockdown mode.\n\n**Reason:** ${reason}\n**Enabled by:** ${interaction.user.tag}`,
            timestamp: new Date().toISOString()
          }]
        });
      } catch (error) {
        console.error(`Failed to send lockdown message to ${channel.name}:`, error);
      }
    }
  }

  // Log to admin channel
  const logChannel = guild.channels.cache.find(
    channel => channel.type === 0 && channel.name.includes('mod-log')
  ) as TextChannel;

  if (logChannel) {
    await logChannel.send({
      embeds: [{
        color: 0xff0000,
        title: '🔒 Lockdown Enabled',
        description: `Server lockdown has been enabled by ${interaction.user.tag}`,
        fields: [
          { name: 'Reason', value: reason, inline: true },
          { name: 'Duration', value: `${AntiRaidConfig.lockdownDurationMs / 60000} minutes`, inline: true }
        ],
        timestamp: new Date().toISOString()
      }]
    });
  }

  await interaction.reply({ 
    content: `🔒 Server lockdown enabled!\n**Reason:** ${reason}\n**Duration:** ${AntiRaidConfig.lockdownDurationMs / 60000} minutes`, 
    ephemeral: true 
  });

  // Auto-disable lockdown after configured duration
  setTimeout(async () => {
    try {
      await disableLockdownAuto(guild);
    } catch (error) {
      console.error('Error auto-disabling lockdown:', error);
    }
  }, AntiRaidConfig.lockdownDurationMs);
}

async function disableLockdown(interaction: any): Promise<void> {
  await disableLockdownAuto(interaction.guild);
  
  await interaction.reply({ 
    content: '🔓 Server lockdown disabled!', 
    ephemeral: true 
  });
}

async function disableLockdownAuto(guild: any): Promise<void> {
  // Re-enable @everyone permissions
  const everyoneRole = guild.roles.everyone;
  await everyoneRole.setPermissions(everyoneRole.permissions.add(PermissionFlagsBits.SendMessages));
  await everyoneRole.setPermissions(everyoneRole.permissions.add(PermissionFlagsBits.Connect));

  // Reset verification level to medium
  await guild.setVerificationLevel(2); // MEDIUM

  // Notify all channels
  const textChannels = guild.channels.cache.filter(channel => channel.type === 0);
  for (const [, channel] of textChannels) {
    if (channel.type === 0) {
      try {
        await channel.send({
          embeds: [{
            color: 0x00ff00,
            title: '🔓 Server Lockdown Disabled',
            description: 'This server is no longer in lockdown mode.',
            timestamp: new Date().toISOString()
          }]
        });
      } catch (error) {
        console.error(`Failed to send unlock message to ${channel.name}:`, error);
      }
    }
  }

  // Log to admin channel
  const logChannel = guild.channels.cache.find(
    channel => channel.type === 0 && channel.name.includes('mod-log')
  ) as TextChannel;

  if (logChannel) {
    await logChannel.send({
      embeds: [{
        color: 0x00ff00,
        title: '🔓 Lockdown Disabled',
        description: 'Server lockdown has been disabled',
        timestamp: new Date().toISOString()
      }]
    });
  }
}