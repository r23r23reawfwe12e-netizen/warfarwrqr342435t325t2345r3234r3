<<<<<<< HEAD
import { prisma } from '../database/prisma.js';
import { generatePartyCode, getPartyBonusPercent } from '../utils/helpers.js';
import { MAX_PARTY_SIZE } from '../constants/index.js';

export async function createParty(leaderId: string, name: string) {
  const existing = await prisma.partyMember.findFirst({ where: { userId: leaderId } });
  if (existing) throw new Error('ALREADY_IN_PARTY');

  let partyCode = generatePartyCode();
  let attempts = 0;
  while (attempts < 10) {
    const exists = await prisma.party.findUnique({ where: { partyCode } });
    if (!exists) break;
    partyCode = generatePartyCode();
    attempts++;
  }

  const party = await prisma.party.create({
    data: {
      name,
      partyCode,
      leaderId,
      members: {
        create: { userId: leaderId, activeToday: true },
      },
    },
    include: {
      members: { include: { user: true } },
      leader: true,
    },
  });

  return party;
}

export async function joinPartyByCode(userId: string, partyCode: string) {
  const existing = await prisma.partyMember.findFirst({ where: { userId } });
  if (existing) throw new Error('ALREADY_IN_PARTY');

  const party = await prisma.party.findUnique({
    where: { partyCode: partyCode.toUpperCase() },
    include: { members: true },
  });

  if (!party) throw new Error('PARTY_NOT_FOUND');
  if (party.members.length >= MAX_PARTY_SIZE) throw new Error('PARTY_FULL');

  await prisma.partyMember.create({
    data: { partyId: party.id, userId },
  });

  return prisma.party.findUniqueOrThrow({
    where: { id: party.id },
    include: { members: { include: { user: true } }, leader: true },
  });
}

export async function leaveParty(userId: string) {
  const membership = await prisma.partyMember.findFirst({
    where: { userId },
    include: { party: { include: { members: true } } },
  });

  if (!membership) throw new Error('NOT_IN_PARTY');

  const { party } = membership;

  if (party.leaderId === userId && party.members.length > 1) {
    const newLeader = party.members.find((m) => m.userId !== userId);
    if (newLeader) {
      await prisma.party.update({
        where: { id: party.id },
        data: { leaderId: newLeader.userId },
      });
    }
  }

  await prisma.partyMember.delete({ where: { id: membership.id } });

  const remaining = await prisma.partyMember.count({ where: { partyId: party.id } });
  if (remaining === 0) {
    await prisma.party.delete({ where: { id: party.id } });
  }

  return party;
}

export async function getPartyInfo(userId: string) {
  const membership = await prisma.partyMember.findFirst({
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

  if (!membership) return null;

  const { party } = membership;
  const bonus = getPartyBonusPercent(party.members.length);
  const activeCount = party.members.filter((m) => m.activeToday).length;
  const bonusActive = party.members.length >= 2 && activeCount / party.members.length >= 0.5;

  return { party, bonus, bonusActive, membership };
}

export function getPartyDeepLink(botUsername: string, partyCode: string): string {
  return `https://t.me/${botUsername}?start=party_${partyCode}`;
}

export async function resetDailyPartyActivity(): Promise<void> {
  await prisma.partyMember.updateMany({ data: { activeToday: false } });
}
=======
import { prisma } from '../database/prisma.js';
import { generatePartyCode, getPartyBonusPercent } from '../utils/helpers.js';
import { MAX_PARTY_SIZE } from '../constants/index.js';

export async function createParty(leaderId: string, name: string) {
  const existing = await prisma.partyMember.findFirst({ where: { userId: leaderId } });
  if (existing) throw new Error('ALREADY_IN_PARTY');

  let partyCode = generatePartyCode();
  let attempts = 0;
  while (attempts < 10) {
    const exists = await prisma.party.findUnique({ where: { partyCode } });
    if (!exists) break;
    partyCode = generatePartyCode();
    attempts++;
  }

  const party = await prisma.party.create({
    data: {
      name,
      partyCode,
      leaderId,
      members: {
        create: { userId: leaderId, activeToday: true },
      },
    },
    include: {
      members: { include: { user: true } },
      leader: true,
    },
  });

  return party;
}

export async function joinPartyByCode(userId: string, partyCode: string) {
  const existing = await prisma.partyMember.findFirst({ where: { userId } });
  if (existing) throw new Error('ALREADY_IN_PARTY');

  const party = await prisma.party.findUnique({
    where: { partyCode: partyCode.toUpperCase() },
    include: { members: true },
  });

  if (!party) throw new Error('PARTY_NOT_FOUND');
  if (party.members.length >= MAX_PARTY_SIZE) throw new Error('PARTY_FULL');

  await prisma.partyMember.create({
    data: { partyId: party.id, userId },
  });

  return prisma.party.findUniqueOrThrow({
    where: { id: party.id },
    include: { members: { include: { user: true } }, leader: true },
  });
}

export async function leaveParty(userId: string) {
  const membership = await prisma.partyMember.findFirst({
    where: { userId },
    include: { party: { include: { members: true } } },
  });

  if (!membership) throw new Error('NOT_IN_PARTY');

  const { party } = membership;

  if (party.leaderId === userId && party.members.length > 1) {
    const newLeader = party.members.find((m) => m.userId !== userId);
    if (newLeader) {
      await prisma.party.update({
        where: { id: party.id },
        data: { leaderId: newLeader.userId },
      });
    }
  }

  await prisma.partyMember.delete({ where: { id: membership.id } });

  const remaining = await prisma.partyMember.count({ where: { partyId: party.id } });
  if (remaining === 0) {
    await prisma.party.delete({ where: { id: party.id } });
  }

  return party;
}

export async function getPartyInfo(userId: string) {
  const membership = await prisma.partyMember.findFirst({
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

  if (!membership) return null;

  const { party } = membership;
  const bonus = getPartyBonusPercent(party.members.length);
  const activeCount = party.members.filter((m) => m.activeToday).length;
  const bonusActive = party.members.length >= 2 && activeCount / party.members.length >= 0.5;

  return { party, bonus, bonusActive, membership };
}

export function getPartyDeepLink(botUsername: string, partyCode: string): string {
  return `https://t.me/${botUsername}?start=party_${partyCode}`;
}

export async function resetDailyPartyActivity(): Promise<void> {
  await prisma.partyMember.updateMany({ data: { activeToday: false } });
}
>>>>>>> 3fa0ac1 (upload project)
