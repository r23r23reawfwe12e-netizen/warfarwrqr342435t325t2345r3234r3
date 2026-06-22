import { prisma } from '../database/prisma.js';
import { getCompletedTaskCount } from './user.service.js';

export async function checkAchievements(userId: string): Promise<string[]> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { achievements: true, attributes: true },
  });

  const allAchievements = await prisma.achievement.findMany();
  const unlockedIds = new Set(user.achievements.map((a) => a.achievementId));
  const newlyUnlocked: string[] = [];

  const completedTasks = await getCompletedTaskCount(userId);

  for (const ach of allAchievements) {
    if (unlockedIds.has(ach.id)) continue;

    let met = false;

    switch (ach.key) {
      case 'streak_30':
        met = user.longestStreak >= 30;
        break;
      case 'tasks_100':
        met = completedTasks >= 100;
        break;
      case 'pushups_1000':
        if (ach.attribute === 'STRENGTH') {
          const attr = user.attributes.find((a) => a.attribute === 'STRENGTH');
          met = (attr?.xp ?? 0) >= 1000;
        }
        break;
      case 'reading_100h':
        if (ach.attribute === 'INTELLIGENCE') {
          const attr = user.attributes.find((a) => a.attribute === 'INTELLIGENCE');
          met = (attr?.xp ?? 0) >= 5000;
        }
        break;
      default:
        break;
    }

    if (met) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: ach.id },
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          totalXp: { increment: ach.xpReward },
          soulCoins: { increment: ach.coinReward },
        },
      });

      if (ach.caseReward) {
        const caseItem = await prisma.item.findFirst({ where: { type: 'CASE' } });
        if (caseItem) {
          await prisma.inventoryItem.upsert({
            where: { userId_itemId: { userId, itemId: caseItem.id } },
            create: { userId, itemId: caseItem.id, quantity: 1 },
            update: { quantity: { increment: 1 } },
          });
        }
      }

      newlyUnlocked.push(ach.key);
    }
  }

  return newlyUnlocked;
}

export async function getUserAchievements(userId: string) {
  return prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { unlockedAt: 'desc' },
  });
}
