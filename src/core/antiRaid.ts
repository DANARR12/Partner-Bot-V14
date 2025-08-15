import { Client, Guild, GuildMember, TextChannel, PermissionFlagsBits } from 'discord.js';
import { rateLimiter } from '../utils/rateLimiter.js';
import { config } from '../config.js';
import { RaidDetection, RaidAction } from '../types.js';

export class AntiRaid {
  private client: Client;
  private raidDetections: Map<string, RaidDetection> = new Map();

  constructor(client: Client) {
    this.client = client;
    this.startCleanupInterval();
  }

  async handleMemberJoin(guild: Guild, member: GuildMember): Promise<void> {
    const guildKey = `guild:${guild.id}:joins`;
    const { count } = await rateLimiter.increment(guildKey, config.antiRaid.memberJoinTimeWindow);

    // Check for raid conditions
    if (count >= config.antiRaid.memberJoinThreshold) {
      await this.triggerRaidProtection(guild, 'member_join', {
        count,
        timeWindow: config.antiRaid.memberJoinTimeWindow,
        members: [member]
      });
    }

    // Check account age
    const accountAge = Date.now() - member.user.createdTimestamp;
    if (accountAge < config.antiRaid.accountAgeThreshold) {
      await this.handleNewAccount(guild, member, accountAge);
    }
  }

  async handleMessageSpam(guild: Guild, userId: string): Promise<void> {
    const userKey = `user:${userId}:messages:${guild.id}`;
    const { count } = await rateLimiter.increment(userKey, config.antiRaid.messageSpamTimeWindow);

    if (count >= config.antiRaid.messageSpamThreshold) {
      await this.triggerRaidProtection(guild, 'message_spam', {
        count,
        timeWindow: config.antiRaid.messageSpamTimeWindow,
        userId
      });
    }
  }

  private async triggerRaidProtection(guild: Guild, type: string, data: any): Promise<void> {
    const detection: RaidDetection = {
      id: `${guild.id}:${type}:${Date.now()}`,
      guildId: guild.id,
      type,
      data,
      timestamp: Date.now(),
      actions: []
    };

    this.raidDetections.set(detection.id, detection);

    // Execute raid protection actions
    const actions: RaidAction[] = [];

    switch (type) {
      case 'member_join':
        actions.push(
          { type: 'lockdown', severity: 'high' },
          { type: 'notify_admins', severity: 'high' },
          { type: 'enable_verification', severity: 'medium' }
        );
        break;
      case 'message_spam':
        actions.push(
          { type: 'mute_user', severity: 'medium' },
          { type: 'notify_admins', severity: 'medium' }
        );
        break;
    }

    for (const action of actions) {
      await this.executeAction(guild, action, detection);
    }
  }

  private async executeAction(guild: Guild, action: RaidAction, detection: RaidDetection): Promise<void> {
    try {
      switch (action.type) {
        case 'lockdown':
          await this.enableLockdown(guild);
          break;
        case 'notify_admins':
          await this.notifyAdmins(guild, detection);
          break;
        case 'enable_verification':
          await this.enableVerification(guild);
          break;
        case 'mute_user':
          await this.muteUser(guild, detection.data.userId);
          break;
      }

      detection.actions.push({
        ...action,
        executedAt: Date.now(),
        success: true
      });
    } catch (error) {
      console.error(`Failed to execute action ${action.type}:`, error);
      detection.actions.push({
        ...action,
        executedAt: Date.now(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async enableLockdown(guild: Guild): Promise<void> {
    // Disable @everyone from sending messages
    const everyoneRole = guild.roles.everyone;
    await everyoneRole.setPermissions(everyoneRole.permissions.remove(PermissionFlagsBits.SendMessages));
  }

  private async notifyAdmins(guild: Guild, detection: RaidDetection): Promise<void> {
    const adminChannel = guild.channels.cache.find(
      channel => channel.type === 0 && channel.name.includes('admin')
    ) as TextChannel;

    if (adminChannel) {
      const embed = {
        color: 0xff0000,
        title: '🚨 Raid Detection Alert',
        description: `Potential raid detected in ${guild.name}`,
        fields: [
          { name: 'Type', value: detection.type, inline: true },
          { name: 'Count', value: detection.data.count.toString(), inline: true },
          { name: 'Time Window', value: `${detection.data.timeWindow / 1000}s`, inline: true }
        ],
        timestamp: new Date().toISOString()
      };

      await adminChannel.send({ embeds: [embed] });
    }
  }

  private async enableVerification(guild: Guild): Promise<void> {
    // Enable verification level to highest
    await guild.setVerificationLevel(4); // VERY_HIGH
  }

  private async muteUser(guild: Guild, userId: string): Promise<void> {
    const member = await guild.members.fetch(userId);
    if (member) {
      await member.timeout(300000, 'Spam detected'); // 5 minutes
    }
  }

  private async handleNewAccount(guild: Guild, member: GuildMember, accountAge: number): Promise<void> {
    const daysOld = Math.floor(accountAge / (24 * 60 * 60 * 1000));
    
    // Auto-timeout very new accounts
    if (daysOld < 1) {
      await member.timeout(600000, 'New account protection'); // 10 minutes
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      rateLimiter.cleanup();
      
      // Clean up old raid detections (older than 1 hour)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      for (const [id, detection] of this.raidDetections.entries()) {
        if (detection.timestamp < oneHourAgo) {
          this.raidDetections.delete(id);
        }
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  getRaidDetections(guildId: string): RaidDetection[] {
    return Array.from(this.raidDetections.values())
      .filter(detection => detection.guildId === guildId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }
}