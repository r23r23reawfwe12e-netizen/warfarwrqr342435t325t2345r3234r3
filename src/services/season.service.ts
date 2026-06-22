<<<<<<< HEAD
import { prisma } from '../database/prisma.js';
import { SEASON_LENGTH_DAYS } from '../constants/index.js';
import { config } from '../config/index.js';

export async function getActiveSeason() {
  let season = await prisma.season.findFirst({ where: { isActive: true } });

  if (!season) {
    const now = new Date();
    const endsAt = new Date(now.getTime() + SEASON_LENGTH_DAYS * 24 * 60 * 60 * 1000);

    season = await prisma.season.create({
      data: {
        number: config.currentSeasonNumber,
        name: `Season ${config.currentSeasonNumber}`,
        startsAt: now,
        endsAt,
        isActive: true,
      },
    });
  }

  return season;
}

export async function getSeasonDaysRemaining(): Promise<number> {
  const season = await getActiveSeason();
  const now = new Date();
  const ms = season.endsAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export async function endSeason(): Promise<void> {
  const season = await prisma.season.findFirst({ where: { isActive: true } });
  if (!season) return;

  const topUsers = await prisma.user.findMany({
    orderBy: { seasonalXp: 'desc' },
    take: 100,
  });

  const rewards = await prisma.seasonReward.findMany({
    where: { seasonId: season.id },
    orderBy: { minRank: 'asc' },
  });

  for (let i = 0; i < topUsers.length; i++) {
    const rank = i + 1;
    const user = topUsers[i];
    const reward = rewards.find((r) => rank >= r.minRank && rank <= r.maxRank);

    if (reward) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          soulCoins: { increment: reward.coinBonus },
          totalXp: { increment: reward.xpBonus },
        },
      });
    }
  }

  await prisma.season.update({
    where: { id: season.id },
    data: { isActive: false },
  });

  await prisma.user.updateMany({ data: { seasonalXp: 0 } });

  const now = new Date();
  await prisma.season.create({
    data: {
      number: season.number + 1,
      name: `Season ${season.number + 1}`,
      startsAt: now,
      endsAt: new Date(now.getTime() + SEASON_LENGTH_DAYS * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });
}
=======
import { prisma } from '../database/prisma.js';
import { SEASON_LENGTH_DAYS } from '../constants/index.js';
import { config } from '../config/index.js';

export async function getActiveSeason() {
  let season = await prisma.season.findFirst({ where: { isActive: true } });

  if (!season) {
    const now = new Date();
    const endsAt = new Date(now.getTime() + SEASON_LENGTH_DAYS * 24 * 60 * 60 * 1000);

    season = await prisma.season.create({
      data: {
        number: config.currentSeasonNumber,
        name: `Season ${config.currentSeasonNumber}`,
        startsAt: now,
        endsAt,
        isActive: true,
      },
    });
  }

  return season;
}

export async function getSeasonDaysRemaining(): Promise<number> {
  const season = await getActiveSeason();
  const now = new Date();
  const ms = season.endsAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export async function endSeason(): Promise<void> {
  const season = await prisma.season.findFirst({ where: { isActive: true } });
  if (!season) return;

  const topUsers = await prisma.user.findMany({
    orderBy: { seasonalXp: 'desc' },
    take: 100,
  });

  const rewards = await prisma.seasonReward.findMany({
    where: { seasonId: season.id },
    orderBy: { minRank: 'asc' },
  });

  for (let i = 0; i < topUsers.length; i++) {
    const rank = i + 1;
    const user = topUsers[i];
    const reward = rewards.find((r) => rank >= r.minRank && rank <= r.maxRank);

    if (reward) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          soulCoins: { increment: reward.coinBonus },
          totalXp: { increment: reward.xpBonus },
        },
      });
    }
  }

  await prisma.season.update({
    where: { id: season.id },
    data: { isActive: false },
  });

  await prisma.user.updateMany({ data: { seasonalXp: 0 } });

  const now = new Date();
  await prisma.season.create({
    data: {
      number: season.number + 1,
      name: `Season ${season.number + 1}`,
      startsAt: now,
      endsAt: new Date(now.getTime() + SEASON_LENGTH_DAYS * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });
}
>>>>>>> 3fa0ac1 (upload project)
