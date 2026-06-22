# SELFQUEST

A production-ready Telegram bot — social RPG self-improvement platform where users level up a virtual character by completing real-life activities.

## Features

- **Multilingual** — Russian, Ukrainian, English
- **Onboarding** — Language selection, profile creation, tutorial
- **Task System** — Create, complete, and track real-life goals with XP rewards
- **6 Attributes** — Strength, Intelligence, Creativity, Finance, Social, Discipline
- **Party System** — Up to 6 members with XP bonuses and one-click deep link invites
- **Duel System** — Challenge friends with ELO-ranked competitive duels
- **Leaderboards** — Global, weekly, monthly, and seasonal rankings
- **Inventory & Cosmetics** — Frames, backgrounds, titles, pets (cosmetic only, no P2W)
- **Case System** — Loot boxes with rarity tiers
- **Achievements & Streaks** — Milestone rewards at 7, 14, 30, 60, 100 days
- **Seasons** — 30-day competitive seasons with rewards
- **Inline Mode** — Share profiles, parties, and leaderboards in any chat

## Tech Stack

- Node.js 20+ / TypeScript
- [Telegraf](https://telegraf.js.org/) — Telegram Bot API
- PostgreSQL + [Prisma](https://www.prisma.io/) ORM
- Redis — Leaderboard caching
- i18next — Localization

## Quick Start

### 1. Prerequisites

- Node.js 20+
- Docker (for PostgreSQL & Redis)

### 2. Start infrastructure

```bash
docker compose up -d
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your `BOT_TOKEN` from [@BotFather](https://t.me/BotFather).

Enable **Inline Mode** in BotFather: `/setinline` → select your bot → enter placeholder text.

### 4. Install & setup database

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

### 5. Run

```bash
# Development (hot reload)
npm run dev

# Production
npm run build
npm start
```

## Commands

| Command | Description |
|---------|-------------|
| `/start` | Onboarding & welcome |
| `/profile` | View profile card |
| `/stats` | Detailed statistics |
| `/task` | Task center |
| `/done` | Quick-complete first active task |
| `/duel` | Duel arena |
| `/party` | Party management |
| `/leaderboard` | Rankings |
| `/inventory` | Cosmetics & items |
| `/settings` | Language & preferences |
| `/help` | Help guide |

## Inline Mode

Type `@YourBotUsername` in any chat:

```
@YourBotUsername profile
@YourBotUsername party
@YourBotUsername leaderboard
```

## Party Invites

When a party is created, the bot generates a deep link:

```
https://t.me/YourBotUsername?start=party_ABC123
```

One click to join — no manual code entry.

## Architecture

```
src/
├── bot/
│   ├── handlers/     # Command & callback handlers
│   └── middleware/   # Session, auth, user loading
├── config/           # Environment config
├── constants/        # Game constants & balances
├── database/         # Prisma & Redis clients
├── i18n/             # Localization (EN/RU/UA)
├── services/         # Business logic
├── types/            # TypeScript types
├── ui/               # Formatters & keyboards
└── utils/            # Helpers
```

## Monetization Policy

**Never sold:** XP, attributes, ELO, wins, or any gameplay power.

**Allowed:** Premium subscription (analytics, history, extra cosmetic slots), Battle Pass, cosmetics, supporter badges — all visual only.

## License

MIT
