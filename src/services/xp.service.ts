<<<<<<< HEAD
import { prisma } from '../database/prisma.js';
import { XP_PER_LEVEL, STREAK_MILESTONES } from '../constants/index.js';
import { isSameDay, daysBetween, getRankFromElo } from '../utils/helpers.js';
import type { Attribute } from '@prisma/client';

export interface XpGrantResult {
  totalXp: number;
  attributeXp: number;
  leveledUp: boolean;
  newLevel: number;
  coinsEarned: number;
  streakMilestone?: number;
  caseGranted: boolean;
}

export async function grantXp(
  userId: string,
  globalXp: number,
  attribute: Attribute,
  attributeXp: number,
  partyBonusPercent = 0,
): Promise<XpGrantResult> {
  const bonusMultiplier = 1 + partyBonusPercent / 100;
  const finalGlobalXp = Math.floor(globalXp * bonusMultiplier);
  const finalAttrXp = Math.floor(attributeXp * bonusMultiplier);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const now = new Date();

  let newStreak = user.currentStreak;
  let streakMilestone: number | undefined;

  if (user.lastActiveDate) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(user.lastActiveDate, now)) {
      // same day, streak unchanged
    } else if (isSameDay(user.lastActiveDate, yesterday)) {
      newStreak = user.currentStreak + 1;
    } else if (daysBetween(user.lastActiveDate, now) > 1) {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  for (const milestone of STREAK_MILESTONES) {
    if (newStreak === milestone && user.currentStreak < milestone) {
      streakMilestone = milestone;
    }
  }

  let newTotalXp = user.totalXp + finalGlobalXp;
  let newLevel = user.level;
  let leveledUp = false;
  let coinsEarned = 0;
  let caseGranted = false;

  while (newTotalXp >= XP_PER_LEVEL(newLevel)) {
    newTotalXp -= XP_PER_LEVEL(newLevel);
    newLevel++;
    leveledUp = true;
    coinsEarned += 10 + newLevel * 2;
    caseGranted = true;
  }

  if (streakMilestone) {
    coinsEarned += streakMilestone * 5;
  }

  await prisma.userAttribute.update({
    where: { userId_attribute: { userId, attribute } },
    data: { xp: { increment: finalAttrXp } },
  });

  let attrRecord = await prisma.userAttribute.findUniqueOrThrow({
    where: { userId_attribute: { userId, attribute } },
  });

  while (attrRecord.xp >= XP_PER_LEVEL(attrRecord.level)) {
    const cost = XP_PER_LEVEL(attrRecord.level);
    attrRecord = await prisma.userAttribute.update({
      where: { userId_attribute: { userId, attribute } },
      data: {
        xp: { decrement: cost },
        level: { increment: 1 },
      },
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalXp: { increment: finalGlobalXp },
      seasonalXp: { increment: finalGlobalXp },
      level: newLevel,
      soulCoins: { increment: coinsEarned },
      currentStreak: newStreak,
      longestStreak: Math.max(user.longestStreak, newStreak),
      lastActiveDate: now,
      currentRank: getRankFromElo(user.eloRating),
    },
  });

  return {
    totalXp: finalGlobalXp,
    attributeXp: finalAttrXp,
    leveledUp,
    newLevel,
    coinsEarned,
    streakMilestone,
    caseGranted,
  };
}

export async function getPartyBonusForUser(userId: string): Promise<number> {
  const membership = await prisma.partyMember.findFirst({
    where: { userId },
    include: { party: { include: { members: true } } },
  });

  if (!membership) return 0;

  const memberCount = membership.party.members.length;
  if (memberCount < 2) return 0;

  const activeCount = membership.party.members.filter((m) => m.activeToday).length;
  const activeRatio = activeCount / memberCount;

  if (activeRatio < 0.5) return 0;

  const bonusMap: Record<number, number> = { 2: 5, 3: 10, 4: 15, 5: 20, 6: 25 };
  return bonusMap[Math.min(memberCount, 6)] ?? 0;
}

export async function markPartyMemberActive(userId: string): Promise<void> {
  await prisma.partyMember.updateMany({
    where: { userId },
    data: { activeToday: true },
  });
}
=======
import { prisma } from '../database/prisma.js';
import { XP_PER_LEVEL, STREAK_MILESTONES } from '../constants/index.js';
import { isSameDay, daysBetween, getRankFromElo } from '../utils/helpers.js';
import type { Attribute } from '@prisma/client';

export interface XpGrantResult {
  totalXp: number;
  attributeXp: number;
  leveledUp: boolean;
  newLevel: number;
  coinsEarned: number;
  streakMilestone?: number;
  caseGranted: boolean;
}

export async function grantXp(
  userId: string,
  globalXp: number,
  attribute: Attribute,
  attributeXp: number,
  partyBonusPercent = 0,
): Promise<XpGrantResult> {
  const bonusMultiplier = 1 + partyBonusPercent / 100;
  const finalGlobalXp = Math.floor(globalXp * bonusMultiplier);
  const finalAttrXp = Math.floor(attributeXp * bonusMultiplier);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const now = new Date();

  let newStreak = user.currentStreak;
  let streakMilestone: number | undefined;

  if (user.lastActiveDate) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(user.lastActiveDate, now)) {
      // same day, streak unchanged
    } else if (isSameDay(user.lastActiveDate, yesterday)) {
      newStreak = user.currentStreak + 1;
    } else if (daysBetween(user.lastActiveDate, now) > 1) {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  for (const milestone of STREAK_MILESTONES) {
    if (newStreak === milestone && user.currentStreak < milestone) {
      streakMilestone = milestone;
    }
  }

  let newTotalXp = user.totalXp + finalGlobalXp;
  let newLevel = user.level;
  let leveledUp = false;
  let coinsEarned = 0;
  let caseGranted = false;

  while (newTotalXp >= XP_PER_LEVEL(newLevel)) {
    newTotalXp -= XP_PER_LEVEL(newLevel);
    newLevel++;
    leveledUp = true;
    coinsEarned += 10 + newLevel * 2;
    caseGranted = true;
  }

  if (streakMilestone) {
    coinsEarned += streakMilestone * 5;
  }

  await prisma.userAttribute.update({
    where: { userId_attribute: { userId, attribute } },
    data: { xp: { increment: finalAttrXp } },
  });

  let attrRecord = await prisma.userAttribute.findUniqueOrThrow({
    where: { userId_attribute: { userId, attribute } },
  });

  while (attrRecord.xp >= XP_PER_LEVEL(attrRecord.level)) {
    const cost = XP_PER_LEVEL(attrRecord.level);
    attrRecord = await prisma.userAttribute.update({
      where: { userId_attribute: { userId, attribute } },
      data: {
        xp: { decrement: cost },
        level: { increment: 1 },
      },
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalXp: { increment: finalGlobalXp },
      seasonalXp: { increment: finalGlobalXp },
      level: newLevel,
      soulCoins: { increment: coinsEarned },
      currentStreak: newStreak,
      longestStreak: Math.max(user.longestStreak, newStreak),
      lastActiveDate: now,
      currentRank: getRankFromElo(user.eloRating),
    },
  });

  return {
    totalXp: finalGlobalXp,
    attributeXp: finalAttrXp,
    leveledUp,
    newLevel,
    coinsEarned,
    streakMilestone,
    caseGranted,
  };
}

export async function getPartyBonusForUser(userId: string): Promise<number> {
  const membership = await prisma.partyMember.findFirst({
    where: { userId },
    include: { party: { include: { members: true } } },
  });

  if (!membership) return 0;

  const memberCount = membership.party.members.length;
  if (memberCount < 2) return 0;

  const activeCount = membership.party.members.filter((m) => m.activeToday).length;
  const activeRatio = activeCount / memberCount;

  if (activeRatio < 0.5) return 0;

  const bonusMap: Record<number, number> = { 2: 5, 3: 10, 4: 15, 5: 20, 6: 25 };
  return bonusMap[Math.min(memberCount, 6)] ?? 0;
}

export async function markPartyMemberActive(userId: string): Promise<void> {
  await prisma.partyMember.updateMany({
    where: { userId },
    data: { activeToday: true },
  });
}
>>>>>>> 3fa0ac1 (upload project)
