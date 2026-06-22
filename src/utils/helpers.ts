import { RANK_THRESHOLDS, XP_PER_LEVEL } from '../constants/index.js';

export function getRankFromElo(elo: number): string {
  let rank = 'Bronze';
  for (const threshold of RANK_THRESHOLDS) {
    if (elo >= threshold.minElo) {
      rank = threshold.name;
    }
  }
  return rank;
}

export function xpForNextLevel(level: number): number {
  return XP_PER_LEVEL(level);
}

export function xpProgress(totalXp: number, level: number): { current: number; needed: number; percent: number } {
  let remaining = totalXp;
  for (let i = 1; i < level; i++) {
    remaining -= XP_PER_LEVEL(i);
  }
  const needed = XP_PER_LEVEL(level);
  const current = Math.max(0, remaining);
  return {
    current,
    needed,
    percent: Math.min(100, Math.floor((current / needed) * 100)),
  };
}

export function progressBar(percent: number, length = 10): string {
  const filled = Math.round((percent / 100) * length);
  const empty = length - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
}

export function generatePartyCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function calculateEloChange(winnerElo: number, loserElo: number, k = 32): { winner: number; loser: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 - expectedWinner;
  return {
    winner: Math.round(k * (1 - expectedWinner)),
    loser: Math.round(k * (0 - expectedLoser)),
  };
}

export function getPartyBonusPercent(memberCount: number): number {
  if (memberCount < 2) return 0;
  if (memberCount >= 6) return 25;
  const map: Record<number, number> = { 2: 5, 3: 10, 4: 15, 5: 20, 6: 25 };
  return map[memberCount] ?? 0;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function daysBetween(d1: Date, d2: Date): number {
  const ms = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function parseStartPayload(text: string): string | null {
  const match = text.match(/^\/start(?:@\w+)?(?:\s+(.+))?/);
  return match?.[1]?.trim() ?? null;
}

export function parseDuelTarget(text: string): string | null {
  const match = text.match(/@(\w+)/);
  return match?.[1] ?? null;
}
