import { prisma } from '../database/prisma.js';
import { CASE_DROP_RATES, RARITY_EMOJI } from '../constants/index.js';
import type { ItemRarity, ItemType } from '@prisma/client';

function rollRarity(): ItemRarity {
  const roll = Math.random() * 100;
  let cumulative = 0;
  const order: ItemRarity[] = ['MYTHIC', 'LEGENDARY', 'EPIC', 'RARE', 'COMMON'];

  const rates: Record<ItemRarity, number> = {
    COMMON: CASE_DROP_RATES.COMMON ?? 60,
    RARE: CASE_DROP_RATES.RARE ?? 25,
    EPIC: CASE_DROP_RATES.EPIC ?? 10,
    LEGENDARY: CASE_DROP_RATES.LEGENDARY ?? 4,
    MYTHIC: CASE_DROP_RATES.MYTHIC ?? 1,
  };

  for (const rarity of order) {
    cumulative += rates[rarity];
    if (roll <= cumulative) return rarity;
  }
  return 'COMMON';
}

export async function openCase(userId: string, caseItemId: string) {
  const inventory = await prisma.inventoryItem.findUnique({
    where: { userId_itemId: { userId, itemId: caseItemId } },
    include: { item: true },
  });

  if (!inventory || inventory.quantity < 1) throw new Error('NO_CASE');

  const rarity = rollRarity();
  const cosmeticTypes: ItemType[] = ['FRAME', 'BACKGROUND', 'TITLE', 'BADGE', 'PET', 'ANIMATION'];

  let item = await prisma.item.findFirst({
    where: { rarity, type: { in: cosmeticTypes } },
    skip: Math.floor(Math.random() * 3),
  });

  if (!item) {
    item = await prisma.item.findFirst({ where: { rarity } });
  }

  if (!item) throw new Error('NO_ITEM');

  if (inventory.quantity <= 1) {
    await prisma.inventoryItem.delete({ where: { id: inventory.id } });
  } else {
    await prisma.inventoryItem.update({
      where: { id: inventory.id },
      data: { quantity: { decrement: 1 } },
    });
  }

  await prisma.inventoryItem.upsert({
    where: { userId_itemId: { userId, itemId: item.id } },
    create: { userId, itemId: item.id },
    update: { quantity: { increment: 1 } },
  });

  return { item, rarityEmoji: RARITY_EMOJI[item.rarity] ?? '✨' };
}

export async function getUserInventory(userId: string) {
  return prisma.inventoryItem.findMany({
    where: { userId },
    include: { item: true },
    orderBy: { acquiredAt: 'desc' },
  });
}

export async function equipItem(userId: string, itemId: string) {
  const inventory = await prisma.inventoryItem.findUnique({
    where: { userId_itemId: { userId, itemId } },
    include: { item: true },
  });

  if (!inventory) throw new Error('NOT_OWNED');

  const { type } = inventory.item;
  const update: Record<string, string | null> = {};

  switch (type) {
    case 'PET':
      update.equippedPetId = itemId;
      break;
    case 'TITLE':
      update.equippedTitleId = itemId;
      break;
    case 'FRAME':
      update.equippedFrameId = itemId;
      break;
    case 'BACKGROUND':
      update.equippedBgId = itemId;
      break;
    default:
      throw new Error('NOT_EQUIPPABLE');
  }

  await prisma.user.update({ where: { id: userId }, data: update });
  return inventory.item;
}

export async function unequipItem(userId: string, type: string) {
  const update: Record<string, null> = {};
  switch (type) {
    case 'PET':
      update.equippedPetId = null;
      break;
    case 'TITLE':
      update.equippedTitleId = null;
      break;
    case 'FRAME':
      update.equippedFrameId = null;
      break;
    case 'BACKGROUND':
      update.equippedBgId = null;
      break;
    default:
      throw new Error('INVALID_TYPE');
  }
  await prisma.user.update({ where: { id: userId }, data: update });
}

export async function grantCaseToUser(userId: string) {
  const caseItem = await prisma.item.findFirst({ where: { type: 'CASE' } });
  if (!caseItem) return;

  await prisma.inventoryItem.upsert({
    where: { userId_itemId: { userId, itemId: caseItem.id } },
    create: { userId, itemId: caseItem.id },
    update: { quantity: { increment: 1 } },
  });
}
