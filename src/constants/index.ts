export const ATTRIBUTES = [
  'STRENGTH',
  'INTELLIGENCE',
  'CREATIVITY',
  'FINANCE',
  'SOCIAL',
  'DISCIPLINE',
] as const;

export type AttributeKey = (typeof ATTRIBUTES)[number];

export const ATTRIBUTE_EMOJI: Record<AttributeKey, string> = {
  STRENGTH: '💪',
  INTELLIGENCE: '🧠',
  CREATIVITY: '🎨',
  FINANCE: '💰',
  SOCIAL: '🤝',
  DISCIPLINE: '⚡',
};

export const RANK_THRESHOLDS = [
  { name: 'Bronze', minElo: 0 },
  { name: 'Silver', minElo: 1100 },
  { name: 'Gold', minElo: 1300 },
  { name: 'Platinum', minElo: 1500 },
  { name: 'Diamond', minElo: 1700 },
  { name: 'Master', minElo: 1900 },
  { name: 'Grandmaster', minElo: 2100 },
];

export const XP_PER_LEVEL = (level: number): number =>
  Math.floor(100 * Math.pow(1.15, level - 1));

export const PARTY_BONUS: Record<number, number> = {
  2: 0.05,
  3: 0.1,
  4: 0.15,
  5: 0.2,
  6: 0.25,
};

export const MAX_PARTY_SIZE = 6;

export const STREAK_MILESTONES = [7, 14, 30, 60, 100];

export const CASE_DROP_RATES: Record<string, number> = {
  COMMON: 60,
  RARE: 25,
  EPIC: 10,
  LEGENDARY: 4,
  MYTHIC: 1,
};

export const RARITY_EMOJI: Record<string, string> = {
  COMMON: '⚪',
  RARE: '🔵',
  EPIC: '🟣',
  LEGENDARY: '🟡',
  MYTHIC: '🔴',
};

export const DUEL_TYPES = [
  'MOST_XP',
  'MOST_TASKS',
  'MOST_WORKOUT',
  'MOST_READING',
  'FIRST_OBJECTIVE',
] as const;

export const DUEL_DURATIONS = [24, 48, 72, 168] as const;

export const ELO_K_FACTOR = 32;

export const SEASON_LENGTH_DAYS = 30;

export const BOT_COMMANDS = [
  { command: 'start', description: 'Start / onboarding' },
  { command: 'profile', description: 'View your profile' },
  { command: 'stats', description: 'Detailed statistics' },
  { command: 'task', description: 'Create & manage tasks' },
  { command: 'done', description: 'Quick complete active task' },
  { command: 'duel', description: 'Challenge a friend' },
  { command: 'party', description: 'Party management' },
  { command: 'leaderboard', description: 'Rankings' },
  { command: 'inventory', description: 'Cosmetics & items' },
  { command: 'settings', description: 'Bot settings' },
  { command: 'help', description: 'Help & guide' },
];

export const TASK_TEMPLATES: Array<{
  titleKey: string;
  attribute: AttributeKey;
  xp: number;
  attrXp: number;
}> = [
  { titleKey: 'task.template.pushups50', attribute: 'STRENGTH', xp: 20, attrXp: 20 },
  { titleKey: 'task.template.read30', attribute: 'INTELLIGENCE', xp: 25, attrXp: 25 },
  { titleKey: 'task.template.study1h', attribute: 'INTELLIGENCE', xp: 50, attrXp: 50 },
  { titleKey: 'task.template.video2h', attribute: 'CREATIVITY', xp: 80, attrXp: 80 },
  { titleKey: 'task.template.work', attribute: 'FINANCE', xp: 40, attrXp: 40 },
  { titleKey: 'task.template.social', attribute: 'SOCIAL', xp: 30, attrXp: 30 },
  { titleKey: 'task.template.habit', attribute: 'DISCIPLINE', xp: 15, attrXp: 15 },
  { titleKey: 'task.template.run', attribute: 'STRENGTH', xp: 35, attrXp: 35 },
  { titleKey: 'task.template.draw', attribute: 'CREATIVITY', xp: 45, attrXp: 45 },
  { titleKey: 'task.template.meditate', attribute: 'DISCIPLINE', xp: 20, attrXp: 20 },
];

export const CALLBACK_PREFIX = {
  LANG: 'lang:',
  ONBOARD: 'onboard:',
  TASK: 'task:',
  PARTY: 'party:',
  DUEL: 'duel:',
  INV: 'inv:',
  LB: 'lb:',
  SETTINGS: 'settings:',
  ACH: 'ach:',
  CASE: 'case:',
  NAV: 'nav:',
} as const;
