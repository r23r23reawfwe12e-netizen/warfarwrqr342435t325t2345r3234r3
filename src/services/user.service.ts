import { prisma } from '../database/prisma.js';
import { ATTRIBUTES } from '../constants/index.js';
import type { Attribute, Language } from '@prisma/client';

export async function findUserByTelegramId(telegramId: number | bigint) {
  return prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
    include: {
      attributes: true,
      equippedPet: true,
      equippedTitle: true,
      equippedFrame: true,
      equippedBg: true,
      settings: true,
    },
  });
}

export async function findUserByUsername(username: string) {
  return prisma.user.findFirst({
    where: { username: { equals: username, mode: 'insensitive' } },
  });
}

export async function createUser(data: {
  telegramId: number | bigint;
  username?: string;
  displayName: string;
  language: Language;
}) {
  await prisma.user.create({
    data: {
      telegramId: BigInt(data.telegramId),
      username: data.username,
      displayName: data.displayName,
      language: data.language,
      settings: { create: {} },
      attributes: {
        create: ATTRIBUTES.map((attribute) => ({ attribute: attribute as Attribute })),
      },
    },
  });

  return findUserByTelegramId(data.telegramId);
}

export async function updateUserLanguage(userId: string, language: Language) {
  await prisma.user.update({
    where: { id: userId },
    data: { language },
  });
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      attributes: true,
      equippedPet: true,
      equippedTitle: true,
      equippedFrame: true,
      equippedBg: true,
      settings: true,
    },
  });
  return user;
}

export async function getUserParty(userId: string) {
  return prisma.partyMember.findFirst({
    where: { userId },
    include: {
      party: {
        include: {
          members: { include: { user: true } },
          leader: true,
        },
      },
    },
  });
}

export async function getCompletedTaskCount(userId: string): Promise<number> {
  return prisma.task.count({
    where: { userId, status: 'COMPLETED' },
  });
}

export async function getDuelStats(userId: string) {
  const participations = await prisma.duelParticipant.findMany({
    where: { userId, duel: { status: 'COMPLETED' } },
    include: { duel: true },
  });

  let won = 0;
  let lost = 0;
  for (const p of participations) {
    if (p.duel.winnerId === userId) won++;
    else if (p.duel.winnerId) lost++;
  }
  return { won, lost };
}
