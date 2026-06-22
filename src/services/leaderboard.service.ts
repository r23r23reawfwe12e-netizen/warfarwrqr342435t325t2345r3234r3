<<<<<<< HEAD
import { prisma } from '../database/prisma.js';
import { cacheGet, cacheSet } from '../database/redis.js';
import type { LeaderboardPeriod } from '@prisma/client';

type Category = 'level' | 'xp' | 'elo' | 'streak';

const CATEGORY_FIELD: Record<Category, string> = {
  level: 'level',
  xp: 'totalXp',
  elo: 'eloRating',
  streak: 'currentStreak',
};

export async function getLeaderboard(
  period: LeaderboardPeriod,
  category: Category,
  limit = 10,
): Promise<Array<{ rank: number; displayName: string; score: number; userId: string }>> {
  const cacheKey = `lb:${period}:${category}:${limit}`;
  const cached = await cacheGet<Array<{ rank: number; displayName: string; score: number; userId: string }>>(cacheKey);
  if (cached) return cached;

  const field = CATEGORY_FIELD[category];
  const orderBy = { [field]: 'desc' as const };

  let where = {};
  if (period === 'SEASONAL') {
    where = { seasonalXp: { gt: 0 } };
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: period === 'SEASONAL' ? { seasonalXp: 'desc' } : orderBy,
    take: limit,
    select: {
      id: true,
      displayName: true,
      level: true,
      totalXp: true,
      eloRating: true,
      currentStreak: true,
      seasonalXp: true,
    },
  });

  const results = users.map((user, index) => {
    let score: number;
    switch (category) {
      case 'level':
        score = user.level;
        break;
      case 'xp':
        score = period === 'SEASONAL' ? user.seasonalXp : user.totalXp;
        break;
      case 'elo':
        score = user.eloRating;
        break;
      case 'streak':
        score = user.currentStreak;
        break;
    }
    return {
      rank: index + 1,
      displayName: user.displayName,
      score,
      userId: user.id,
    };
  });

  await cacheSet(cacheKey, results, 120);
  return results;
}

export async function getUserRank(userId: string, category: Category): Promise<number> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const field = CATEGORY_FIELD[category] as 'level' | 'totalXp' | 'eloRating' | 'currentStreak';
  const score = user[field];

  const rank = await prisma.user.count({
    where: { [field]: { gt: score } },
  });

  return rank + 1;
}
=======
import { prisma } from '../database/prisma.js';
import { cacheGet, cacheSet } from '../database/redis.js';
import type { LeaderboardPeriod } from '@prisma/client';

type Category = 'level' | 'xp' | 'elo' | 'streak';

const CATEGORY_FIELD: Record<Category, string> = {
  level: 'level',
  xp: 'totalXp',
  elo: 'eloRating',
  streak: 'currentStreak',
};

export async function getLeaderboard(
  period: LeaderboardPeriod,
  category: Category,
  limit = 10,
): Promise<Array<{ rank: number; displayName: string; score: number; userId: string }>> {
  const cacheKey = `lb:${period}:${category}:${limit}`;
  const cached = await cacheGet<Array<{ rank: number; displayName: string; score: number; userId: string }>>(cacheKey);
  if (cached) return cached;

  const field = CATEGORY_FIELD[category];
  const orderBy = { [field]: 'desc' as const };

  let where = {};
  if (period === 'SEASONAL') {
    where = { seasonalXp: { gt: 0 } };
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: period === 'SEASONAL' ? { seasonalXp: 'desc' } : orderBy,
    take: limit,
    select: {
      id: true,
      displayName: true,
      level: true,
      totalXp: true,
      eloRating: true,
      currentStreak: true,
      seasonalXp: true,
    },
  });

  const results = users.map((user, index) => {
    let score: number;
    switch (category) {
      case 'level':
        score = user.level;
        break;
      case 'xp':
        score = period === 'SEASONAL' ? user.seasonalXp : user.totalXp;
        break;
      case 'elo':
        score = user.eloRating;
        break;
      case 'streak':
        score = user.currentStreak;
        break;
    }
    return {
      rank: index + 1,
      displayName: user.displayName,
      score,
      userId: user.id,
    };
  });

  await cacheSet(cacheKey, results, 120);
  return results;
}

export async function getUserRank(userId: string, category: Category): Promise<number> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const field = CATEGORY_FIELD[category] as 'level' | 'totalXp' | 'eloRating' | 'currentStreak';
  const score = user[field];

  const rank = await prisma.user.count({
    where: { [field]: { gt: score } },
  });

  return rank + 1;
}
>>>>>>> 3fa0ac1 (upload project)
