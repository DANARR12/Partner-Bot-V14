export interface RaidDetection {
  id: string;
  guildId: string;
  type: 'member_join' | 'message_spam' | 'mention_spam' | 'link_spam' | 'webhook_spam';
  data: any;
  timestamp: number;
  actions: RaidAction[];
}

export interface RaidAction {
  type: 'lockdown' | 'notify_admins' | 'enable_verification' | 'mute_user' | 'ban_user' | 'timeout_user';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  executedAt?: number;
  success?: boolean;
  error?: string;
}

export interface RateLimitData {
  count: number;
  resetTime: number;
}

export interface AntiRaidStats {
  totalDetections: number;
  recentDetections: number;
  memberJoinRaids: number;
  messageSpamRaids: number;
  mentionSpamRaids: number;
  linkSpamRaids: number;
  webhookSpamRaids: number;
  uptime: number;
  averageResponseTime: number;
}

export interface GuildConfig {
  guildId: string;
  enabled: boolean;
  joinThreshold: number;
  joinWindowMs: number;
  messageThreshold: number;
  messageWindowMs: number;
  mentionThreshold: number;
  mentionWindowMs: number;
  linkThreshold: number;
  linkWindowMs: number;
  timeoutMinutes: number;
  lockdownDurationMs: number;
  minAccountAgeMs: number;
  blockInvites: boolean;
  banOnExtreme: boolean;
}

export interface SpamDetection {
  userId: string;
  guildId: string;
  type: 'message' | 'mention' | 'link' | 'invite';
  count: number;
  timeWindow: number;
  timestamp: number;
}

export interface MemberJoinData {
  userId: string;
  guildId: string;
  accountAge: number;
  timestamp: number;
  isNewAccount: boolean;
}

export interface LockdownStatus {
  guildId: string;
  isActive: boolean;
  enabledAt?: number;
  enabledBy?: string;
  reason?: string;
  expiresAt?: number;
}

// Discord.js extensions
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, any>;
  }
}