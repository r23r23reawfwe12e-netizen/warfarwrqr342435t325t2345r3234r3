<<<<<<< HEAD
import { PrismaClient, ItemRarity, ItemType } from '@prisma/client';

const prisma = new PrismaClient();

const items: Array<{
  key: string;
  nameKey: string;
  descriptionKey: string;
  type: ItemType;
  rarity: ItemRarity;
  price: number;
  imageEmoji: string;
}> = [
  { key: 'case_standard', nameKey: 'item.case.standard', descriptionKey: 'item.case.standard.desc', type: 'CASE', rarity: 'COMMON', price: 0, imageEmoji: '📦' },
  { key: 'frame_neon', nameKey: 'item.frame.neon', descriptionKey: 'item.frame.neon.desc', type: 'FRAME', rarity: 'RARE', price: 200, imageEmoji: '🖼' },
  { key: 'frame_cyber', nameKey: 'item.frame.cyber', descriptionKey: 'item.frame.cyber.desc', type: 'FRAME', rarity: 'EPIC', price: 500, imageEmoji: '🖼' },
  { key: 'frame_legend', nameKey: 'item.frame.legend', descriptionKey: 'item.frame.legend.desc', type: 'FRAME', rarity: 'LEGENDARY', price: 1000, imageEmoji: '🖼' },
  { key: 'bg_dark', nameKey: 'item.bg.dark', descriptionKey: 'item.bg.dark.desc', type: 'BACKGROUND', rarity: 'COMMON', price: 100, imageEmoji: '🌌' },
  { key: 'bg_neon_city', nameKey: 'item.bg.neon', descriptionKey: 'item.bg.neon.desc', type: 'BACKGROUND', rarity: 'RARE', price: 300, imageEmoji: '🌃' },
  { key: 'bg_matrix', nameKey: 'item.bg.matrix', descriptionKey: 'item.bg.matrix.desc', type: 'BACKGROUND', rarity: 'EPIC', price: 600, imageEmoji: '💚' },
  { key: 'title_warrior', nameKey: 'item.title.warrior', descriptionKey: 'item.title.warrior.desc', type: 'TITLE', rarity: 'COMMON', price: 150, imageEmoji: '🏷' },
  { key: 'title_scholar', nameKey: 'item.title.scholar', descriptionKey: 'item.title.scholar.desc', type: 'TITLE', rarity: 'RARE', price: 350, imageEmoji: '🏷' },
  { key: 'title_legend', nameKey: 'item.title.legend', descriptionKey: 'item.title.legend.desc', type: 'TITLE', rarity: 'LEGENDARY', price: 800, imageEmoji: '🏷' },
  { key: 'pet_wolf', nameKey: 'item.pet.wolf', descriptionKey: 'item.pet.wolf.desc', type: 'PET', rarity: 'RARE', price: 400, imageEmoji: '🐺' },
  { key: 'pet_fox', nameKey: 'item.pet.fox', descriptionKey: 'item.pet.fox.desc', type: 'PET', rarity: 'RARE', price: 400, imageEmoji: '🦊' },
  { key: 'pet_owl', nameKey: 'item.pet.owl', descriptionKey: 'item.pet.owl.desc', type: 'PET', rarity: 'EPIC', price: 700, imageEmoji: '🦉' },
  { key: 'pet_dragon', nameKey: 'item.pet.dragon', descriptionKey: 'item.pet.dragon.desc', type: 'PET', rarity: 'LEGENDARY', price: 1200, imageEmoji: '🐉' },
  { key: 'pet_phoenix', nameKey: 'item.pet.phoenix', descriptionKey: 'item.pet.phoenix.desc', type: 'PET', rarity: 'MYTHIC', price: 2000, imageEmoji: '🔥' },
  { key: 'badge_streak', nameKey: 'item.badge.streak', descriptionKey: 'item.badge.streak.desc', type: 'BADGE', rarity: 'EPIC', price: 0, imageEmoji: '🔥' },
  { key: 'badge_duel', nameKey: 'item.badge.duel', descriptionKey: 'item.badge.duel.desc', type: 'BADGE', rarity: 'RARE', price: 0, imageEmoji: '⚔️' },
];

const achievements = [
  { key: 'streak_30', nameKey: 'ach.streak30', descriptionKey: 'ach.streak30.desc', requirement: 30, xpReward: 500, coinReward: 100, caseReward: true },
  { key: 'tasks_100', nameKey: 'ach.tasks100', descriptionKey: 'ach.tasks100.desc', requirement: 100, xpReward: 300, coinReward: 75, caseReward: false },
  { key: 'pushups_1000', nameKey: 'ach.pushups1000', descriptionKey: 'ach.pushups1000.desc', requirement: 1000, attribute: 'STRENGTH' as const, xpReward: 400, coinReward: 80, caseReward: true },
  { key: 'reading_100h', nameKey: 'ach.reading100', descriptionKey: 'ach.reading100.desc', requirement: 5000, attribute: 'INTELLIGENCE' as const, xpReward: 600, coinReward: 120, caseReward: true },
];

const streakRewards = [
  { days: 7, xpReward: 50, coinReward: 25 },
  { days: 14, xpReward: 100, coinReward: 50 },
  { days: 30, xpReward: 250, coinReward: 100, titleKey: 'item.title.warrior' },
  { days: 60, xpReward: 500, coinReward: 200, achievementKey: 'streak_30' },
  { days: 100, xpReward: 1000, coinReward: 500, titleKey: 'item.title.legend' },
];

async function main() {
  console.log('🌱 Seeding SELFQUEST database...');

  for (const item of items) {
    await prisma.item.upsert({
      where: { key: item.key },
      create: item,
      update: item,
    });
  }

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { key: ach.key },
      create: ach,
      update: ach,
    });
  }

  for (const reward of streakRewards) {
    await prisma.streakReward.upsert({
      where: { days: reward.days },
      create: reward,
      update: reward,
    });
  }

  const existingSeason = await prisma.season.findFirst({ where: { isActive: true } });
  if (!existingSeason) {
    const now = new Date();
    await prisma.season.create({
      data: {
        number: 1,
        name: 'Season 1',
        startsAt: now,
        endsAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });
  }

  console.log('✅ Seed complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
=======
import { PrismaClient, ItemRarity, ItemType } from '@prisma/client';

const prisma = new PrismaClient();

const items: Array<{
  key: string;
  nameKey: string;
  descriptionKey: string;
  type: ItemType;
  rarity: ItemRarity;
  price: number;
  imageEmoji: string;
}> = [
  { key: 'case_standard', nameKey: 'item.case.standard', descriptionKey: 'item.case.standard.desc', type: 'CASE', rarity: 'COMMON', price: 0, imageEmoji: '📦' },
  { key: 'frame_neon', nameKey: 'item.frame.neon', descriptionKey: 'item.frame.neon.desc', type: 'FRAME', rarity: 'RARE', price: 200, imageEmoji: '🖼' },
  { key: 'frame_cyber', nameKey: 'item.frame.cyber', descriptionKey: 'item.frame.cyber.desc', type: 'FRAME', rarity: 'EPIC', price: 500, imageEmoji: '🖼' },
  { key: 'frame_legend', nameKey: 'item.frame.legend', descriptionKey: 'item.frame.legend.desc', type: 'FRAME', rarity: 'LEGENDARY', price: 1000, imageEmoji: '🖼' },
  { key: 'bg_dark', nameKey: 'item.bg.dark', descriptionKey: 'item.bg.dark.desc', type: 'BACKGROUND', rarity: 'COMMON', price: 100, imageEmoji: '🌌' },
  { key: 'bg_neon_city', nameKey: 'item.bg.neon', descriptionKey: 'item.bg.neon.desc', type: 'BACKGROUND', rarity: 'RARE', price: 300, imageEmoji: '🌃' },
  { key: 'bg_matrix', nameKey: 'item.bg.matrix', descriptionKey: 'item.bg.matrix.desc', type: 'BACKGROUND', rarity: 'EPIC', price: 600, imageEmoji: '💚' },
  { key: 'title_warrior', nameKey: 'item.title.warrior', descriptionKey: 'item.title.warrior.desc', type: 'TITLE', rarity: 'COMMON', price: 150, imageEmoji: '🏷' },
  { key: 'title_scholar', nameKey: 'item.title.scholar', descriptionKey: 'item.title.scholar.desc', type: 'TITLE', rarity: 'RARE', price: 350, imageEmoji: '🏷' },
  { key: 'title_legend', nameKey: 'item.title.legend', descriptionKey: 'item.title.legend.desc', type: 'TITLE', rarity: 'LEGENDARY', price: 800, imageEmoji: '🏷' },
  { key: 'pet_wolf', nameKey: 'item.pet.wolf', descriptionKey: 'item.pet.wolf.desc', type: 'PET', rarity: 'RARE', price: 400, imageEmoji: '🐺' },
  { key: 'pet_fox', nameKey: 'item.pet.fox', descriptionKey: 'item.pet.fox.desc', type: 'PET', rarity: 'RARE', price: 400, imageEmoji: '🦊' },
  { key: 'pet_owl', nameKey: 'item.pet.owl', descriptionKey: 'item.pet.owl.desc', type: 'PET', rarity: 'EPIC', price: 700, imageEmoji: '🦉' },
  { key: 'pet_dragon', nameKey: 'item.pet.dragon', descriptionKey: 'item.pet.dragon.desc', type: 'PET', rarity: 'LEGENDARY', price: 1200, imageEmoji: '🐉' },
  { key: 'pet_phoenix', nameKey: 'item.pet.phoenix', descriptionKey: 'item.pet.phoenix.desc', type: 'PET', rarity: 'MYTHIC', price: 2000, imageEmoji: '🔥' },
  { key: 'badge_streak', nameKey: 'item.badge.streak', descriptionKey: 'item.badge.streak.desc', type: 'BADGE', rarity: 'EPIC', price: 0, imageEmoji: '🔥' },
  { key: 'badge_duel', nameKey: 'item.badge.duel', descriptionKey: 'item.badge.duel.desc', type: 'BADGE', rarity: 'RARE', price: 0, imageEmoji: '⚔️' },
];

const achievements = [
  { key: 'streak_30', nameKey: 'ach.streak30', descriptionKey: 'ach.streak30.desc', requirement: 30, xpReward: 500, coinReward: 100, caseReward: true },
  { key: 'tasks_100', nameKey: 'ach.tasks100', descriptionKey: 'ach.tasks100.desc', requirement: 100, xpReward: 300, coinReward: 75, caseReward: false },
  { key: 'pushups_1000', nameKey: 'ach.pushups1000', descriptionKey: 'ach.pushups1000.desc', requirement: 1000, attribute: 'STRENGTH' as const, xpReward: 400, coinReward: 80, caseReward: true },
  { key: 'reading_100h', nameKey: 'ach.reading100', descriptionKey: 'ach.reading100.desc', requirement: 5000, attribute: 'INTELLIGENCE' as const, xpReward: 600, coinReward: 120, caseReward: true },
];

const streakRewards = [
  { days: 7, xpReward: 50, coinReward: 25 },
  { days: 14, xpReward: 100, coinReward: 50 },
  { days: 30, xpReward: 250, coinReward: 100, titleKey: 'item.title.warrior' },
  { days: 60, xpReward: 500, coinReward: 200, achievementKey: 'streak_30' },
  { days: 100, xpReward: 1000, coinReward: 500, titleKey: 'item.title.legend' },
];

async function main() {
  console.log('🌱 Seeding SELFQUEST database...');

  for (const item of items) {
    await prisma.item.upsert({
      where: { key: item.key },
      create: item,
      update: item,
    });
  }

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { key: ach.key },
      create: ach,
      update: ach,
    });
  }

  for (const reward of streakRewards) {
    await prisma.streakReward.upsert({
      where: { days: reward.days },
      create: reward,
      update: reward,
    });
  }

  const existingSeason = await prisma.season.findFirst({ where: { isActive: true } });
  if (!existingSeason) {
    const now = new Date();
    await prisma.season.create({
      data: {
        number: 1,
        name: 'Season 1',
        startsAt: now,
        endsAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });
  }

  console.log('✅ Seed complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
>>>>>>> 3fa0ac1 (upload project)
