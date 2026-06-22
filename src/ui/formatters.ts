<<<<<<< HEAD
import { t, toI18nLang, type SupportedLanguage } from '../i18n/index.js';
import { ATTRIBUTE_EMOJI, RARITY_EMOJI } from '../constants/index.js';
import { progressBar, xpProgress, escapeHtml } from '../utils/helpers.js';
import type { User } from '@prisma/client';

type ProfileUser = User & {
  attributes?: Array<{ attribute: string; xp: number; level: number }>;
  equippedPet?: { nameKey: string; imageEmoji: string } | null;
  equippedTitle?: { nameKey: string } | null;
  equippedFrame?: { nameKey: string } | null;
};

export function formatProfileCard(user: ProfileUser, lang: SupportedLanguage): string {
  const xp = xpProgress(user.totalXp, user.level);
  const bar = progressBar(xp.percent);

  const petText = user.equippedPet
    ? `${user.equippedPet.imageEmoji} ${t(user.equippedPet.nameKey, lang)}`
    : t('profile.no_pet', lang);

  const titleText = user.equippedTitle
    ? t(user.equippedTitle.nameKey, lang)
    : t('profile.no_title', lang);

  let attributesBlock = '';
  if (user.attributes?.length) {
    const lines = user.attributes.map((a) => {
      const emoji = ATTRIBUTE_EMOJI[a.attribute as keyof typeof ATTRIBUTE_EMOJI] ?? '•';
      const name = t(`attribute.${a.attribute}`, lang);
      const attrXp = xpProgress(a.xp, a.level);
      const attrBar = progressBar(attrXp.percent, 8);
      return `${emoji} ${name} Lv.${a.level} ${attrBar}`;
    });
    attributesBlock = `\n\n<b>${t('profile.attributes', lang)}</b>\n${lines.join('\n')}`;
  }

  return [
    '╔══════════════════════╗',
    `║  ${t('profile.title', lang)}  ║`,
    '╚══════════════════════╝',
    '',
    `👤 <b>${escapeHtml(user.displayName)}</b>`,
    titleText !== t('profile.no_title', lang) ? `🏷 ${titleText}` : '',
    '',
    `⭐ ${t('profile.level', lang)}: <b>${user.level}</b>`,
    `✨ ${t('profile.xp', lang)}: ${xp.current}/${xp.needed}`,
    `${bar} ${xp.percent}%`,
    '',
    `⚔️ ${t('profile.elo', lang)}: <b>${user.eloRating}</b>`,
    `🏅 ${t('profile.rank', lang)}: <b>${user.currentRank}</b>`,
    `🔥 ${t('profile.streak', lang)}: <b>${user.currentStreak}</b> days`,
    `💎 ${t('profile.coins', lang)}: <b>${user.soulCoins}</b>`,
    '',
    `${t('profile.pet', lang)}: ${petText}`,
    attributesBlock,
  ]
    .filter(Boolean)
    .join('\n');
}

export function formatStats(
  user: User,
  stats: {
    tasksCompleted: number;
    duelsWon: number;
    duelsLost: number;
    achievementCount: number;
  },
  lang: SupportedLanguage,
): string {
  return [
    `📊 <b>${t('stats.title', lang)}</b>`,
    '',
    `${t('stats.tasks_completed', lang)}: <b>${stats.tasksCompleted}</b>`,
    `${t('stats.total_xp', lang)}: <b>${user.totalXp}</b>`,
    `${t('stats.seasonal_xp', lang)}: <b>${user.seasonalXp}</b>`,
    `${t('stats.duels_won', lang)}: <b>${stats.duelsWon}</b>`,
    `${t('stats.duels_lost', lang)}: <b>${stats.duelsLost}</b>`,
    `${t('stats.achievements', lang)}: <b>${stats.achievementCount}</b>`,
    `${t('stats.longest_streak', lang)}: <b>${user.longestStreak}</b>`,
    `${t('stats.trust_score', lang)}: <b>${user.trustScore}</b>`,
  ].join('\n');
}

export function formatLeaderboard(
  entries: Array<{ rank: number; displayName: string; score: number }>,
  period: string,
  category: string,
  lang: SupportedLanguage,
): string {
  const header = `🏆 <b>${t('leaderboard.title', lang)}</b>\n${t(`leaderboard.period.${period.toLowerCase()}`, lang)} · ${t(`leaderboard.category.${category}`, lang)}\n`;

  if (entries.length === 0) {
    return header + '\n' + t('leaderboard.empty', lang);
  }

  const lines = entries.map((e) =>
    t('leaderboard.entry', lang, {
      rank: e.rank,
      name: escapeHtml(e.displayName),
      score: e.score,
    }),
  );

  return header + '\n' + lines.join('\n');
}

export function formatPartyInfo(
  party: {
    name: string;
    partyXp: number;
    partyCode: string;
    members: Array<{ user: { displayName: string }; activeToday: boolean }>;
  },
  bonus: number,
  bonusActive: boolean,
  lang: SupportedLanguage,
): string {
  const memberLines = party.members
    .map((m) => {
      const dot = m.activeToday ? '🟢' : '⚪';
      return `${dot} ${escapeHtml(m.user.displayName)}`;
    })
    .join('\n');

  return t('party.info', lang, {
    name: escapeHtml(party.name),
    count: party.members.length,
    xp: party.partyXp,
    bonus,
    members: memberLines,
  }) + `\n\n${bonusActive ? t('party.bonus_active', lang) : t('party.bonus_inactive', lang)}`;
}

export function formatInventoryItem(
  item: { nameKey: string; type: string; rarity: string; imageEmoji: string },
  quantity: number,
  lang: SupportedLanguage,
): string {
  const rarity = RARITY_EMOJI[item.rarity] ?? '';
  return `${item.imageEmoji} ${t(item.nameKey, lang)} ${rarity} x${quantity}`;
}

export function formatWelcome(lang: SupportedLanguage): string {
  return [
    t('welcome.title', lang),
    '',
    t('welcome.subtitle', lang),
    '',
    t('welcome.cta', lang),
  ].join('\n');
}

export function getUserLang(user: User | null | undefined): SupportedLanguage {
  if (!user) return 'en';
  return toI18nLang(user.language);
}
=======
import { t, toI18nLang, type SupportedLanguage } from '../i18n/index.js';
import { ATTRIBUTE_EMOJI, RARITY_EMOJI } from '../constants/index.js';
import { progressBar, xpProgress, escapeHtml } from '../utils/helpers.js';
import type { User } from '@prisma/client';

type ProfileUser = User & {
  attributes?: Array<{ attribute: string; xp: number; level: number }>;
  equippedPet?: { nameKey: string; imageEmoji: string } | null;
  equippedTitle?: { nameKey: string } | null;
  equippedFrame?: { nameKey: string } | null;
};

export function formatProfileCard(user: ProfileUser, lang: SupportedLanguage): string {
  const xp = xpProgress(user.totalXp, user.level);
  const bar = progressBar(xp.percent);

  const petText = user.equippedPet
    ? `${user.equippedPet.imageEmoji} ${t(user.equippedPet.nameKey, lang)}`
    : t('profile.no_pet', lang);

  const titleText = user.equippedTitle
    ? t(user.equippedTitle.nameKey, lang)
    : t('profile.no_title', lang);

  let attributesBlock = '';
  if (user.attributes?.length) {
    const lines = user.attributes.map((a) => {
      const emoji = ATTRIBUTE_EMOJI[a.attribute as keyof typeof ATTRIBUTE_EMOJI] ?? '•';
      const name = t(`attribute.${a.attribute}`, lang);
      const attrXp = xpProgress(a.xp, a.level);
      const attrBar = progressBar(attrXp.percent, 8);
      return `${emoji} ${name} Lv.${a.level} ${attrBar}`;
    });
    attributesBlock = `\n\n<b>${t('profile.attributes', lang)}</b>\n${lines.join('\n')}`;
  }

  return [
    '╔══════════════════════╗',
    `║  ${t('profile.title', lang)}  ║`,
    '╚══════════════════════╝',
    '',
    `👤 <b>${escapeHtml(user.displayName)}</b>`,
    titleText !== t('profile.no_title', lang) ? `🏷 ${titleText}` : '',
    '',
    `⭐ ${t('profile.level', lang)}: <b>${user.level}</b>`,
    `✨ ${t('profile.xp', lang)}: ${xp.current}/${xp.needed}`,
    `${bar} ${xp.percent}%`,
    '',
    `⚔️ ${t('profile.elo', lang)}: <b>${user.eloRating}</b>`,
    `🏅 ${t('profile.rank', lang)}: <b>${user.currentRank}</b>`,
    `🔥 ${t('profile.streak', lang)}: <b>${user.currentStreak}</b> days`,
    `💎 ${t('profile.coins', lang)}: <b>${user.soulCoins}</b>`,
    '',
    `${t('profile.pet', lang)}: ${petText}`,
    attributesBlock,
  ]
    .filter(Boolean)
    .join('\n');
}

export function formatStats(
  user: User,
  stats: {
    tasksCompleted: number;
    duelsWon: number;
    duelsLost: number;
    achievementCount: number;
  },
  lang: SupportedLanguage,
): string {
  return [
    `📊 <b>${t('stats.title', lang)}</b>`,
    '',
    `${t('stats.tasks_completed', lang)}: <b>${stats.tasksCompleted}</b>`,
    `${t('stats.total_xp', lang)}: <b>${user.totalXp}</b>`,
    `${t('stats.seasonal_xp', lang)}: <b>${user.seasonalXp}</b>`,
    `${t('stats.duels_won', lang)}: <b>${stats.duelsWon}</b>`,
    `${t('stats.duels_lost', lang)}: <b>${stats.duelsLost}</b>`,
    `${t('stats.achievements', lang)}: <b>${stats.achievementCount}</b>`,
    `${t('stats.longest_streak', lang)}: <b>${user.longestStreak}</b>`,
    `${t('stats.trust_score', lang)}: <b>${user.trustScore}</b>`,
  ].join('\n');
}

export function formatLeaderboard(
  entries: Array<{ rank: number; displayName: string; score: number }>,
  period: string,
  category: string,
  lang: SupportedLanguage,
): string {
  const header = `🏆 <b>${t('leaderboard.title', lang)}</b>\n${t(`leaderboard.period.${period.toLowerCase()}`, lang)} · ${t(`leaderboard.category.${category}`, lang)}\n`;

  if (entries.length === 0) {
    return header + '\n' + t('leaderboard.empty', lang);
  }

  const lines = entries.map((e) =>
    t('leaderboard.entry', lang, {
      rank: e.rank,
      name: escapeHtml(e.displayName),
      score: e.score,
    }),
  );

  return header + '\n' + lines.join('\n');
}

export function formatPartyInfo(
  party: {
    name: string;
    partyXp: number;
    partyCode: string;
    members: Array<{ user: { displayName: string }; activeToday: boolean }>;
  },
  bonus: number,
  bonusActive: boolean,
  lang: SupportedLanguage,
): string {
  const memberLines = party.members
    .map((m) => {
      const dot = m.activeToday ? '🟢' : '⚪';
      return `${dot} ${escapeHtml(m.user.displayName)}`;
    })
    .join('\n');

  return t('party.info', lang, {
    name: escapeHtml(party.name),
    count: party.members.length,
    xp: party.partyXp,
    bonus,
    members: memberLines,
  }) + `\n\n${bonusActive ? t('party.bonus_active', lang) : t('party.bonus_inactive', lang)}`;
}

export function formatInventoryItem(
  item: { nameKey: string; type: string; rarity: string; imageEmoji: string },
  quantity: number,
  lang: SupportedLanguage,
): string {
  const rarity = RARITY_EMOJI[item.rarity] ?? '';
  return `${item.imageEmoji} ${t(item.nameKey, lang)} ${rarity} x${quantity}`;
}

export function formatWelcome(lang: SupportedLanguage): string {
  return [
    t('welcome.title', lang),
    '',
    t('welcome.subtitle', lang),
    '',
    t('welcome.cta', lang),
  ].join('\n');
}

export function getUserLang(user: User | null | undefined): SupportedLanguage {
  if (!user) return 'en';
  return toI18nLang(user.language);
}
>>>>>>> 3fa0ac1 (upload project)
