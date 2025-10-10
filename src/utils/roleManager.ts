/**
 * Gerenciador de roles do Discord
 */

import { Guild, GuildMember, Role } from 'discord.js';
import { createTemporaryRole, removeTemporaryRole } from './supabase';
import { addDays } from 'date-fns';

/**
 * Adiciona role a um membro
 */
export async function addRoleToMember(
  guild: Guild,
  userId: string,
  roleId: string
): Promise<void> {
  try {
    const member = await guild.members.fetch(userId);
    const role = await guild.roles.fetch(roleId);

    if (!role) {
      throw new Error('Role não encontrada');
    }

    await member.roles.add(role);
    console.log(`✅ Role ${role.name} adicionada para ${member.user.tag}`);
  } catch (error) {
    console.error('Erro ao adicionar role:', error);
    throw error;
  }
}

/**
 * Remove role de um membro
 */
export async function removeRoleFromMember(
  guild: Guild,
  userId: string,
  roleId: string
): Promise<void> {
  try {
    const member = await guild.members.fetch(userId);
    const role = await guild.roles.fetch(roleId);

    if (!role) {
      throw new Error('Role não encontrada');
    }

    await member.roles.remove(role);
    console.log(`✅ Role ${role.name} removida de ${member.user.tag}`);
  } catch (error) {
    console.error('Erro ao remover role:', error);
    throw error;
  }
}

/**
 * Adiciona role temporária a um membro
 */
export async function addTemporaryRole(
  guild: Guild,
  userId: string,
  roleId: string,
  durationDays: number = 30
): Promise<void> {
  try {
    // Adicionar role ao membro
    await addRoleToMember(guild, userId, roleId);

    // Registrar no banco de dados
    const expiresAt = addDays(new Date(), durationDays);
    await createTemporaryRole({
      guild_id: guild.id,
      user_id: userId,
      role_id: roleId,
      expires_at: expiresAt
    });

    console.log(`✅ Role temporária criada: expira em ${expiresAt.toLocaleDateString()}`);
  } catch (error) {
    console.error('Erro ao adicionar role temporária:', error);
    throw error;
  }
}

/**
 * Verifica e remove roles temporárias expiradas
 */
export async function checkAndRemoveExpiredRoles(guild: Guild): Promise<number> {
  try {
    const { getExpiredTemporaryRoles } = await import('./supabase');
    const expiredRoles = await getExpiredTemporaryRoles();

    let removedCount = 0;

    for (const tempRole of expiredRoles) {
      if (tempRole.guild_id !== guild.id) continue;

      try {
        await removeRoleFromMember(guild, tempRole.user_id, tempRole.role_id);
        await removeTemporaryRole(tempRole.id);
        removedCount++;
      } catch (error) {
        console.error(`Erro ao remover role temporária expirada:`, error);
      }
    }

    if (removedCount > 0) {
      console.log(`✅ ${removedCount} role(s) temporária(s) removida(s)`);
    }

    return removedCount;
  } catch (error) {
    console.error('Erro ao verificar roles expiradas:', error);
    return 0;
  }
}

/**
 * Cria role de produto se não existir
 */
export async function createProductRole(
  guild: Guild,
  productName: string,
  color?: number
): Promise<Role> {
  try {
    const roleName = `🛒 ${productName}`;
    
    // Verificar se role já existe
    const existingRole = guild.roles.cache.find(r => r.name === roleName);
    if (existingRole) return existingRole;

    // Criar nova role
    const role = await guild.roles.create({
      name: roleName,
      color: color || 0x5865F2,
      reason: `Role criada automaticamente para produto: ${productName}`
    });

    console.log(`✅ Role criada: ${roleName}`);
    return role;
  } catch (error) {
    console.error('Erro ao criar role de produto:', error);
    throw error;
  }
}
