import { prisma } from '../database/prisma.js';
import { grantXp, getPartyBonusForUser, markPartyMemberActive } from './xp.service.js';
import { checkAchievements } from './achievement.service.js';
import type { Attribute, ProofType, TaskStatus } from '@prisma/client';

export async function createTask(data: {
  userId: string;
  title: string;
  attribute: Attribute;
  xpReward?: number;
  attributeXp?: number;
  proofType?: ProofType;
  description?: string;
}) {
  const task = await prisma.task.create({
    data: {
      userId: data.userId,
      title: data.title,
      description: data.description,
      attribute: data.attribute,
      xpReward: data.xpReward ?? 10,
      attributeXp: data.attributeXp ?? 10,
      proofType: data.proofType ?? 'NONE',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  return task;
}

export async function getActiveTasks(userId: string) {
  return prisma.task.findMany({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getFirstActiveTask(userId: string) {
  return prisma.task.findFirst({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
  });
}

export async function completeTask(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId, status: 'ACTIVE' },
  });

  if (!task) return null;

  await prisma.task.update({
    where: { id: taskId },
    data: { status: 'COMPLETED' as TaskStatus, completedAt: new Date() },
  });

  const partyBonus = await getPartyBonusForUser(userId);
  await markPartyMemberActive(userId);

  const xpResult = await grantXp(
    userId,
    task.xpReward,
    task.attribute,
    task.attributeXp,
    partyBonus,
  );

  await checkAchievements(userId);

  const partyMembership = await prisma.partyMember.findFirst({ where: { userId } });
  if (partyMembership) {
    await prisma.party.update({
      where: { id: partyMembership.partyId },
      data: { partyXp: { increment: task.xpReward } },
    });
  }

  return { task, xpResult, partyBonus };
}

export async function cancelTask(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId, status: 'ACTIVE' },
  });
  if (!task) return null;

  await prisma.task.update({
    where: { id: taskId },
    data: { status: 'CANCELLED' },
  });
  return task;
}

export async function expireOldTasks(): Promise<number> {
  const result = await prisma.task.updateMany({
    where: {
      status: 'ACTIVE',
      expiresAt: { lt: new Date() },
    },
    data: { status: 'EXPIRED' },
  });
  return result.count;
}
