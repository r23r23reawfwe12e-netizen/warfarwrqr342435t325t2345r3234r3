<<<<<<< HEAD
import { prisma } from '../database/prisma.js';
import { calculateEloChange, getRankFromElo } from '../utils/helpers.js';
import type { DuelStakeType, DuelType } from '@prisma/client';

export async function createDuel(data: {
  creatorId: string;
  opponentId: string;
  type: DuelType;
  durationHours: number;
  stakeType: DuelStakeType;
  stakeAmount?: number;
  stakeItemId?: string;
  objective?: string;
}) {
  if (data.creatorId === data.opponentId) throw new Error('SELF_DUEL');

  const duel = await prisma.duel.create({
    data: {
      creatorId: data.creatorId,
      type: data.type,
      durationHours: data.durationHours,
      stakeType: data.stakeType,
      stakeAmount: data.stakeAmount ?? 0,
      stakeItemId: data.stakeItemId,
      objective: data.objective,
      participants: {
        create: [
          { userId: data.creatorId, accepted: true },
          { userId: data.opponentId, accepted: false },
        ],
      },
    },
    include: {
      participants: { include: { user: true } },
      creator: true,
    },
  });

  return duel;
}

export async function respondToDuel(duelId: string, userId: string, accept: boolean) {
  const duel = await prisma.duel.findUniqueOrThrow({
    where: { id: duelId },
    include: { participants: true },
  });

  if (duel.status !== 'PENDING') throw new Error('DUEL_NOT_PENDING');

  const participant = duel.participants.find((p) => p.userId === userId);
  if (!participant || participant.userId === duel.creatorId) throw new Error('NOT_OPPONENT');

  if (!accept) {
    await prisma.duel.update({
      where: { id: duelId },
      data: { status: 'DECLINED' },
    });
    return { duel, accepted: false };
  }

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + duel.durationHours * 60 * 60 * 1000);

  await prisma.duelParticipant.update({
    where: { duelId_userId: { duelId, userId } },
    data: { accepted: true },
  });

  const updated = await prisma.duel.update({
    where: { id: duelId },
    data: { status: 'ACTIVE', startedAt, endsAt },
    include: { participants: { include: { user: true } }, creator: true },
  });

  return { duel: updated, accepted: true };
}

export async function updateDuelProgress(userId: string, xpGained: number, taskCompleted = false) {
  const activeParticipations = await prisma.duelParticipant.findMany({
    where: {
      userId,
      accepted: true,
      duel: { status: 'ACTIVE' },
    },
    include: { duel: true },
  });

  for (const p of activeParticipations) {
    await prisma.duelParticipant.update({
      where: { id: p.id },
      data: {
        progressXp: { increment: xpGained },
        progressTasks: taskCompleted ? { increment: 1 } : undefined,
      },
    });
  }
}

export async function resolveExpiredDuels(): Promise<number> {
  const expired = await prisma.duel.findMany({
    where: { status: 'ACTIVE', endsAt: { lte: new Date() } },
    include: { participants: { include: { user: true } } },
  });

  for (const duel of expired) {
    await resolveDuel(duel.id);
  }

  return expired.length;
}

export async function resolveDuel(duelId: string) {
  const duel = await prisma.duel.findUniqueOrThrow({
    where: { id: duelId },
    include: { participants: { include: { user: true } } },
  });

  if (duel.status !== 'ACTIVE') return;

  const [p1, p2] = duel.participants;
  if (!p1 || !p2) return;

  let winnerId: string | null = null;

  switch (duel.type) {
    case 'MOST_XP':
      if (p1.progressXp > p2.progressXp) winnerId = p1.userId;
      else if (p2.progressXp > p1.progressXp) winnerId = p2.userId;
      break;
    case 'MOST_TASKS':
      if (p1.progressTasks > p2.progressTasks) winnerId = p1.userId;
      else if (p2.progressTasks > p1.progressTasks) winnerId = p2.userId;
      break;
    case 'MOST_WORKOUT':
    case 'MOST_READING':
    case 'FIRST_OBJECTIVE':
      if (p1.progressValue > p2.progressValue) winnerId = p1.userId;
      else if (p2.progressValue > p1.progressValue) winnerId = p2.userId;
      break;
  }

  let eloChanges: Record<string, number> = {};

  if (winnerId && duel.isRanked) {
    const winner = duel.participants.find((p) => p.userId === winnerId)!;
    const loser = duel.participants.find((p) => p.userId !== winnerId)!;
    const changes = calculateEloChange(winner.user.eloRating, loser.user.eloRating);

    eloChanges[winner.userId] = changes.winner;
    eloChanges[loser.userId] = changes.loser;

    await prisma.user.update({
      where: { id: winner.userId },
      data: {
        eloRating: { increment: changes.winner },
        currentRank: getRankFromElo(winner.user.eloRating + changes.winner),
      },
    });

    await prisma.user.update({
      where: { id: loser.userId },
      data: {
        eloRating: { increment: changes.loser },
        currentRank: getRankFromElo(Math.max(0, loser.user.eloRating + changes.loser)),
      },
    });
  }

  if (winnerId && duel.stakeType === 'XP' && duel.stakeAmount > 0) {
    const loser = duel.participants.find((p) => p.userId !== winnerId)!;
    await prisma.user.update({
      where: { id: winnerId },
      data: { totalXp: { increment: duel.stakeAmount } },
    });
    await prisma.user.update({
      where: { id: loser.userId },
      data: { totalXp: { decrement: Math.min(duel.stakeAmount, loser.user.totalXp) } },
    });
  }

  if (winnerId && duel.stakeType === 'SOUL_COINS' && duel.stakeAmount > 0) {
    const loser = duel.participants.find((p) => p.userId !== winnerId)!;
    await prisma.user.update({
      where: { id: winnerId },
      data: { soulCoins: { increment: duel.stakeAmount } },
    });
    await prisma.user.update({
      where: { id: loser.userId },
      data: {
        soulCoins: { decrement: Math.min(duel.stakeAmount, loser.user.soulCoins) },
      },
    });
  }

  for (const p of duel.participants) {
    await prisma.duelParticipant.update({
      where: { id: p.id },
      data: { eloChange: eloChanges[p.userId] ?? 0 },
    });
  }

  await prisma.duel.update({
    where: { id: duelId },
    data: { status: 'COMPLETED', winnerId },
  });

  return { winnerId, eloChanges };
}

export async function getActiveDuels(userId: string) {
  return prisma.duel.findMany({
    where: {
      status: { in: ['PENDING', 'ACTIVE'] },
      participants: { some: { userId } },
    },
    include: { participants: { include: { user: true } }, creator: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPendingDuelsForUser(userId: string) {
  return prisma.duel.findMany({
    where: {
      status: 'PENDING',
      participants: { some: { userId, accepted: false } },
    },
    include: { participants: { include: { user: true } }, creator: true },
  });
}
=======
import { prisma } from '../database/prisma.js';
import { calculateEloChange, getRankFromElo } from '../utils/helpers.js';
import type { DuelStakeType, DuelType } from '@prisma/client';

export async function createDuel(data: {
  creatorId: string;
  opponentId: string;
  type: DuelType;
  durationHours: number;
  stakeType: DuelStakeType;
  stakeAmount?: number;
  stakeItemId?: string;
  objective?: string;
}) {
  if (data.creatorId === data.opponentId) throw new Error('SELF_DUEL');

  const duel = await prisma.duel.create({
    data: {
      creatorId: data.creatorId,
      type: data.type,
      durationHours: data.durationHours,
      stakeType: data.stakeType,
      stakeAmount: data.stakeAmount ?? 0,
      stakeItemId: data.stakeItemId,
      objective: data.objective,
      participants: {
        create: [
          { userId: data.creatorId, accepted: true },
          { userId: data.opponentId, accepted: false },
        ],
      },
    },
    include: {
      participants: { include: { user: true } },
      creator: true,
    },
  });

  return duel;
}

export async function respondToDuel(duelId: string, userId: string, accept: boolean) {
  const duel = await prisma.duel.findUniqueOrThrow({
    where: { id: duelId },
    include: { participants: true },
  });

  if (duel.status !== 'PENDING') throw new Error('DUEL_NOT_PENDING');

  const participant = duel.participants.find((p) => p.userId === userId);
  if (!participant || participant.userId === duel.creatorId) throw new Error('NOT_OPPONENT');

  if (!accept) {
    await prisma.duel.update({
      where: { id: duelId },
      data: { status: 'DECLINED' },
    });
    return { duel, accepted: false };
  }

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + duel.durationHours * 60 * 60 * 1000);

  await prisma.duelParticipant.update({
    where: { duelId_userId: { duelId, userId } },
    data: { accepted: true },
  });

  const updated = await prisma.duel.update({
    where: { id: duelId },
    data: { status: 'ACTIVE', startedAt, endsAt },
    include: { participants: { include: { user: true } }, creator: true },
  });

  return { duel: updated, accepted: true };
}

export async function updateDuelProgress(userId: string, xpGained: number, taskCompleted = false) {
  const activeParticipations = await prisma.duelParticipant.findMany({
    where: {
      userId,
      accepted: true,
      duel: { status: 'ACTIVE' },
    },
    include: { duel: true },
  });

  for (const p of activeParticipations) {
    await prisma.duelParticipant.update({
      where: { id: p.id },
      data: {
        progressXp: { increment: xpGained },
        progressTasks: taskCompleted ? { increment: 1 } : undefined,
      },
    });
  }
}

export async function resolveExpiredDuels(): Promise<number> {
  const expired = await prisma.duel.findMany({
    where: { status: 'ACTIVE', endsAt: { lte: new Date() } },
    include: { participants: { include: { user: true } } },
  });

  for (const duel of expired) {
    await resolveDuel(duel.id);
  }

  return expired.length;
}

export async function resolveDuel(duelId: string) {
  const duel = await prisma.duel.findUniqueOrThrow({
    where: { id: duelId },
    include: { participants: { include: { user: true } } },
  });

  if (duel.status !== 'ACTIVE') return;

  const [p1, p2] = duel.participants;
  if (!p1 || !p2) return;

  let winnerId: string | null = null;

  switch (duel.type) {
    case 'MOST_XP':
      if (p1.progressXp > p2.progressXp) winnerId = p1.userId;
      else if (p2.progressXp > p1.progressXp) winnerId = p2.userId;
      break;
    case 'MOST_TASKS':
      if (p1.progressTasks > p2.progressTasks) winnerId = p1.userId;
      else if (p2.progressTasks > p1.progressTasks) winnerId = p2.userId;
      break;
    case 'MOST_WORKOUT':
    case 'MOST_READING':
    case 'FIRST_OBJECTIVE':
      if (p1.progressValue > p2.progressValue) winnerId = p1.userId;
      else if (p2.progressValue > p1.progressValue) winnerId = p2.userId;
      break;
  }

  let eloChanges: Record<string, number> = {};

  if (winnerId && duel.isRanked) {
    const winner = duel.participants.find((p) => p.userId === winnerId)!;
    const loser = duel.participants.find((p) => p.userId !== winnerId)!;
    const changes = calculateEloChange(winner.user.eloRating, loser.user.eloRating);

    eloChanges[winner.userId] = changes.winner;
    eloChanges[loser.userId] = changes.loser;

    await prisma.user.update({
      where: { id: winner.userId },
      data: {
        eloRating: { increment: changes.winner },
        currentRank: getRankFromElo(winner.user.eloRating + changes.winner),
      },
    });

    await prisma.user.update({
      where: { id: loser.userId },
      data: {
        eloRating: { increment: changes.loser },
        currentRank: getRankFromElo(Math.max(0, loser.user.eloRating + changes.loser)),
      },
    });
  }

  if (winnerId && duel.stakeType === 'XP' && duel.stakeAmount > 0) {
    const loser = duel.participants.find((p) => p.userId !== winnerId)!;
    await prisma.user.update({
      where: { id: winnerId },
      data: { totalXp: { increment: duel.stakeAmount } },
    });
    await prisma.user.update({
      where: { id: loser.userId },
      data: { totalXp: { decrement: Math.min(duel.stakeAmount, loser.user.totalXp) } },
    });
  }

  if (winnerId && duel.stakeType === 'SOUL_COINS' && duel.stakeAmount > 0) {
    const loser = duel.participants.find((p) => p.userId !== winnerId)!;
    await prisma.user.update({
      where: { id: winnerId },
      data: { soulCoins: { increment: duel.stakeAmount } },
    });
    await prisma.user.update({
      where: { id: loser.userId },
      data: {
        soulCoins: { decrement: Math.min(duel.stakeAmount, loser.user.soulCoins) },
      },
    });
  }

  for (const p of duel.participants) {
    await prisma.duelParticipant.update({
      where: { id: p.id },
      data: { eloChange: eloChanges[p.userId] ?? 0 },
    });
  }

  await prisma.duel.update({
    where: { id: duelId },
    data: { status: 'COMPLETED', winnerId },
  });

  return { winnerId, eloChanges };
}

export async function getActiveDuels(userId: string) {
  return prisma.duel.findMany({
    where: {
      status: { in: ['PENDING', 'ACTIVE'] },
      participants: { some: { userId } },
    },
    include: { participants: { include: { user: true } }, creator: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPendingDuelsForUser(userId: string) {
  return prisma.duel.findMany({
    where: {
      status: 'PENDING',
      participants: { some: { userId, accepted: false } },
    },
    include: { participants: { include: { user: true } }, creator: true },
  });
}
>>>>>>> 3fa0ac1 (upload project)
