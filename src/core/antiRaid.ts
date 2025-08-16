import { AntiRaidConfig as C } from '../config.js';
import { Client, Guild, GuildMember, PermissionFlagsBits, Role } from 'discord.js';
import { SlidingWindowCounter } from '../utils/slidingWindowCounter.js';

type WindowMap = Map<string, SlidingWindowCounter>; // key -> counter

export class AntiRaid {
  constructor(private client: Client, private store?: Map<string, any>) {}

  // per-guild windows
  guildJoinWindows: Map<string, SlidingWindowCounter> = new Map();
  guildChannelMsgWindows: Map<string, SlidingWindowCounter> = new Map();
  guildWebhookMsgWindows: Map<string, SlidingWindowCounter> = new Map();

  lockdowns: Map<string, NodeJS.Timeout> = new Map();

  private getCounter(map: Map<string, SlidingWindowCounter>, key: string, ms: number) {
    let c = map.get(key);
    if (!c) { c = new SlidingWindowCounter(ms); map.set(key, c); }
    return c;
  }

  noteJoin(guildId: string): number {
    return this.getCounter(this.guildJoinWindows, guildId, C.joinWindowMs).push();
  }

  noteChannelMessage(guildId: string): number {
    return this.getCounter(this.guildChannelMsgWindows, guildId, C.channelWindowMs).push();
  }

  noteWebhookMessage(guildId: string): number {
    return this.getCounter(this.guildWebhookMsgWindows, guildId, C.webhookWindowMs).push();
  }

  async safeTimeout(member: GuildMember, reason: string) {
    try {
      await member.timeout(C.timeoutMinutes * 60_000, reason);
    } catch {}
  }

  async safeKick(member: GuildMember, reason: string) {
    try { await member.kick(reason); } catch {}
  }

  async safeBan(member: GuildMember, reason: string) {
    try { await member.ban({ reason, deleteMessageSeconds: 60 * 60 }); } catch {}
  }

  async lockdown(guild: Guild, reason = 'Anti-raid lockdown') {
    const key = guild.id;
    if (this.lockdowns.has(key)) return;

    const tasks: Promise<any>[] = [];
    const roles = guild.roles.cache;
    for (const name of C.lockdownRolesToClamp) {
      const role: Role | undefined =
        name === '@everyone' ? guild.roles.everyone : roles.find(r => r.name === name);
      if (!role) continue;
      const newPerms = role.permissions
        .remove(PermissionFlagsBits.SendMessages)
        .remove(PermissionFlagsBits.CreatePublicThreads)
        .remove(PermissionFlagsBits.SendMessagesInThreads)
        .remove(PermissionFlagsBits.AddReactions)
        .remove(PermissionFlagsBits.Connect);
      tasks.push(role.setPermissions(newPerms).catch(() => {}));
    }
    await Promise.all(tasks);

    const t = setTimeout(() => this.unlock(guild).catch(() => {}), C.lockdownDurationMs);
    this.lockdowns.set(key, t);

    try {
      const sys = guild.systemChannel ?? guild.channels.cache.find(c => c.isTextBased() && 'send' in c);
      // @ts-ignore
      sys?.send(`🔒 **Lockdown enabled** for ${(C.lockdownDurationMs/60000)|0} min. Reason: ${reason}`);
    } catch {}
  }

  async unlock(guild: Guild) {
    const t = this.lockdowns.get(guild.id);
    if (t) clearTimeout(t);
    this.lockdowns.delete(guild.id);

    const tasks: Promise<any>[] = [];
    for (const name of C.lockdownRolesToClamp) {
      const role: Role | undefined =
        name === '@everyone' ? guild.roles.everyone : guild.roles.cache.find(r => r.name === name);
      if (!role) continue;
      // You might want to restore from a snapshot. For simplicity, restore common perms:
      const restored = role.permissions
        .add(PermissionFlagsBits.SendMessages)
        .add(PermissionFlagsBits.Connect);
      tasks.push(role.setPermissions(restored).catch(() => {}));
    }
    await Promise.all(tasks);
    try {
      const sys = guild.systemChannel ?? guild.channels.cache.find(c => c.isTextBased() && 'send' in c);
      // @ts-ignore
      sys?.send(`✅ **Lockdown disabled**. Stay safe.`);
    } catch {}
  }

  // Legacy methods for backward compatibility
  async handleMemberJoin(guild: Guild, member: GuildMember): Promise<void> {
    const count = this.noteJoin(guild.id);
    
    if (count >= C.joinThreshold) {
      await this.lockdown(guild, `Join raid detected: ${count} joins`);
    }

    // Check account age
    const accountAge = Date.now() - member.user.createdTimestamp;
    if (accountAge < C.minAccountAgeMs) {
      await this.safeTimeout(member, 'New account protection');
    }
  }

  async handleMessageSpam(guild: Guild, userId: string): Promise<void> {
    const count = this.noteChannelMessage(guild.id);
    
    if (count >= C.channelMsgThreshold) {
      await this.lockdown(guild, `Message spam detected: ${count} messages`);
    }
  }

  getRaidDetections(guildId: string): any[] {
    // Return empty array for now - can be enhanced later
    return [];
  }
}