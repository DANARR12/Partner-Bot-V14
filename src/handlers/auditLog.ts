import { GuildAuditLogsEntry, AuditLogEvent } from 'discord.js';

export async function handleAuditLog(auditLog: GuildAuditLogsEntry): Promise<void> {
  try {
    // Monitor for suspicious moderation actions
    switch (auditLog.action) {
      case AuditLogEvent.MemberKick:
      case AuditLogEvent.MemberBanAdd:
      case AuditLogEvent.MemberBanRemove:
      case AuditLogEvent.MemberUpdate:
        await handleMemberModeration(auditLog);
        break;
      
      case AuditLogEvent.ChannelDelete:
      case AuditLogEvent.RoleDelete:
        await handleDestructiveAction(auditLog);
        break;
      
      case AuditLogEvent.WebhookCreate:
      case AuditLogEvent.WebhookUpdate:
        await handleWebhookAction(auditLog);
        break;
    }
  } catch (error) {
    console.error('Error handling audit log:', error);
  }
}

async function handleMemberModeration(auditLog: GuildAuditLogsEntry): Promise<void> {
  const executor = auditLog.executor;
  if (!executor) return;

  // Check for rapid moderation actions
  const key = `mod:${executor.id}:${auditLog.guild?.id}`;
  const { count } = await import('../utils/rateLimiter.js').then(m => m.rateLimiter.increment(key, 60000)); // 1 minute window

  if (count > 5) {
    console.log(`⚠️  Rapid moderation detected from ${executor.tag}: ${count} actions in 1 minute`);
    
    // Log to admin channel
    const logChannel = auditLog.guild?.channels.cache.find(
      channel => channel.type === 0 && channel.name.includes('mod-log')
    );
    
    if (logChannel && logChannel.type === 0) {
      await logChannel.send({
        embeds: [{
          color: 0xffa500,
          title: '⚠️ Rapid Moderation Alert',
          description: `${executor.tag} performed ${count} moderation actions in 1 minute`,
          fields: [
            { name: 'Action', value: auditLog.action, inline: true },
            { name: 'Target', value: auditLog.target?.toString() || 'Unknown', inline: true }
          ],
          timestamp: new Date().toISOString()
        }]
      });
    }
  }
}

async function handleDestructiveAction(auditLog: GuildAuditLogsEntry): Promise<void> {
  const executor = auditLog.executor;
  if (!executor) return;

  console.log(`🚨 Destructive action detected: ${auditLog.action} by ${executor.tag}`);
  
  // Check if executor has proper permissions
  const member = await auditLog.guild?.members.fetch(executor.id);
  if (member && !member.permissions.has('Administrator')) {
    console.log(`⚠️  Non-admin performed destructive action: ${auditLog.action}`);
  }
}

async function handleWebhookAction(auditLog: GuildAuditLogsEntry): Promise<void> {
  const executor = auditLog.executor;
  if (!executor) return;

  // Monitor webhook creation/updates for potential abuse
  const key = `webhook:${executor.id}:${auditLog.guild?.id}`;
  const { count } = await import('../utils/rateLimiter.js').then(m => m.rateLimiter.increment(key, 300000)); // 5 minute window

  if (count > 3) {
    console.log(`⚠️  Webhook abuse detected from ${executor.tag}: ${count} actions in 5 minutes`);
  }
}