# BondedAscent

## Overview

BondedAscent is a full-stack web application designed for dynamic protocol management between paired users, featuring a gamified system with XP tracking, leveling, dares, rewards, punishments, journaling, notifications, and activity logging. It supports two distinct user roles ("sub" and "dom") with role-based interfaces and interactions. The entire app is usable through the Command Center — a central hub integrating all app functionality. The aesthetic is dark, adult, rated-R: deep reds, blacks, crimsons, burgundy, charcoal, and blood-red accents only.

## User Preferences

Preferred communication style: Simple, everyday language.
Color palette: Five dark accent families — NO bright/playful colors.
  - **Blood Red**: #dc2626, #991b1b, #7f1d1d (demands, commands, punishments, conflicts)
  - **Dark Gold**: #d4a24e, #92400e, #451a03 (rewards, achievements, ratings, stickers, wagers)
  - **Blood Orange/Ember**: #e87640, #c2410c, #9a3412, #431407 (dares, sessions, countdowns)
  - **Deep Bronze**: #b87333, #78350f, #451a03 (rituals, devotions, journal, desired changes)
  - **Ash/Slate**: slate-300/400/500/600 (info, permissions, limits, secrets)
  - **Blacks**: #030303, #0a0a0a backgrounds; ash-white text (slate-300/400, #c8bfb6)
  - CSS variables: --accent-gold, --accent-bronze, --accent-ember, --accent-ash (defined in index.css)
Sub role theme: deep wine/burgundy (hue ~345), NOT purple/pink.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State/Data Fetching**: TanStack React Query
- **UI Components**: shadcn/ui (new-york style) built on Radix UI and Tailwind CSS v4
- **Styling**: Tailwind CSS, CSS variables for theming, custom fonts (Montserrat, Playfair Display, Inter)
- **Build Tool**: Vite
- **Key Components**:
    - **Command Center**: Central hub (`CommandProtocols` component) integrating ALL app functionality — **multi-window layout** with 9 category panels (Urgent, Directives, Punishments, Rewards, Scenes, Reviews, Connection, Structure, Journal) each with distinct sizes/shapes, color-coded borders/glow, scrollable content areas. Expandable feed cards with **completion notes prompt** (optional notes when marking items done), pinning, global search, live activity timeline, sparkline trend charts, bulk actions across 24+ feed types, feature drawers.
    - **Live Session Engine** (`live-session.tsx`): Full-screen immersive session mode with Dom control panel and Sub receiver view, intensity-based visual effects, phase management, safe word support. **Partner-synced via SSE**: Dom starts session via API (`POST /api/play-sessions/start-live`), Sub detects instantly via Server-Sent Events (polling kept as fallback). Instructions/intensity/phase sync in real-time via `PUT /api/play-sessions/:id/live`. Push notification sent to partner on start/end.
    - **Interrogation Mode** (`interrogation.tsx`): Three components — InterrogationSetup (Dom), InterrogationMode (Sub full-screen Q&A with timer), InterrogationResults. Partner-synced via SSE events.
    - **Confession Booth** (`confession-booth.tsx`): Full-screen overlay with Sub typing mode and Dom review/response mode.
    - **Aftercare Checklist** (`aftercare-checklist.tsx`): Post-session checklist with calming dark aesthetic, mood rating, notes.
    - **Auto-Dom Simulation** (`auto-dom-simulation.tsx`): Full-screen overlay to activate AI simulation at intensity 1–10. Three modes: Dom & Sub, Switch (both get both roles), Sub & Dom (reversed). Generates tasks, rituals, standing orders, dares for each user per role-side. Content tagged with `simulationId` for cleanup on deactivation.
    - **Mood Chart** (`mood-chart.tsx`): SVG line chart for mood/obedience history over 30 days.
    - **Ambient Presence** (`ambient-presence.tsx`): Persistent indicator showing pending protocol count.
    - **Universal Creator**: Content creation via category picker grid and slash-command shortcuts.
    - **Feature Drawers**: Collapsible sections for quick access, sticker rewards, access control, crisis override, protocol/structure, scenes/trials, bond/reflection, and records/surveillance.
    - **Reward Chest** (`reward-chest.tsx`): Sub-side treasure chest UI. Sub claims rewards from feed into chest, then redeems them to partner when ready. Dark gold/bronze aesthetic.
    - **Punishment Chest** (`punishment-chest.tsx`): Dom-side punishment arsenal. Dom stockpiles punishments, deploys them onto Sub at chosen time. Blood red/black aesthetic with prebuilt punishment grid.
    - **Sticker Board** (`sticker-board.tsx`): Enhanced three-tab board embedded directly in profile. Tab 1: Dom sticker notes (Post-It sticky notes with random rotations, color-coded). Tab 2: Achievement Wall (trophy/badge cards for earned achievements, high-rated performances). Tab 3: Documents Wall (paper-stapled-to-wall aesthetic showing hard limits, contracts, filed decisions, permission grants — clickable to expand full content).
    - **Profile Picture Upload**: Circular avatar with camera overlay, uploads via existing `POST /api/user/profile-pic`. Visible in header, profile, partner display, and mobile nav.
    - **Media Upload**: Polymorphic file attachment system with `<MediaUpload>` component.

### Pages
- **Dashboard** (`dashboard.tsx`): Main view — only header, safeword, and CommandProtocols. No content below Command Center.
- **Contracts** (`contracts.tsx`): Contract lifecycle with signing ceremony animation.
- **Training Programs** (`training-programs.tsx`): Day-by-day training with progress ladder and graduation.
- **Scene Scripts** (`scene-scripts.tsx`): Script builder with step editor, timeline visualization, preview mode.
- **Analytics** (`analytics.tsx`): Three tabs — Analytics (charts/heatmaps), Calendar (monthly grid), Relationship (bond health).

### Backend
- **Framework**: Express 5 with Node.js and TypeScript
- **API Pattern**: RESTful JSON API (`/api/` prefix)
- **Authentication**: Passport.js with Local Strategy, session-based using `express-session` and `connect-pg-simple`.
- **Password Hashing**: Node.js `crypto.scrypt`.
- **Password Reset**: 6-digit code flow (no token exposure in API responses).
- **Request Validation**: Zod schemas.
- **Push Notifications**: web-push with VAPID keys (`server/push.ts`).
- **Server-Sent Events**: `server/sse.ts` — real-time partner sync for live sessions, interrogations, notifications, presence. Client hook: `client/src/lib/useSSE.ts`.
- **API Logging**: Sensitive endpoints redacted, large responses truncated (`server/index.ts`).
- **Session Secret**: Auto-generated random secret if `SESSION_SECRET` env var not set (with warning).
- **Development**: Vite dev server as middleware with HMR.

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with `drizzle-zod`.
- **Schema**: `shared/schema.ts` for shared client/server schema.
- **Storage Layer**: Abstracted via `IStorage` interface in `server/storage.ts`.
- **Tables** (44 total): users, tasks, check_ins, dares, rewards, punishments, journal_entries, notifications, activity_log, rituals, limits, secrets, wagers, ratings, countdown_events, standing_orders, permission_requests, devotions, conflicts, desired_changes, achievements, play_sessions, accusations, intensity_sessions, obedience_trials, trial_steps, sensation_cards, sensation_spins, sealed_orders, endurance_challenges, endurance_checkins, media, stickers, feature_settings, body_map_zones, push_subscriptions, contracts, confessions, training_programs, training_days, training_enrollments, scene_scripts, script_steps, interrogation_sessions, interrogation_questions, aftercare_items, streaks, simulations.

### API Endpoints (key new ones)
- `GET /api/sse` — Server-Sent Events endpoint for real-time partner sync (auto-reconnect)
- `GET /api/trends` — 7-day rolling trend data for sparklines
- `GET /api/streaks` — Current/longest streaks per type
- `GET /api/analytics` — 30-day mood, task completion, active hours
- `GET /api/analytics/relationship` — Days bonded, sessions, bond health
- CRUD: `/api/contracts`, `/api/confessions`, `/api/training-programs`, `/api/scene-scripts`, `/api/interrogation-sessions`, `/api/aftercare-items`
- `POST /api/play-sessions/start-live` — Dom starts a partner-synced live session (creates DB record, notifies partner)
- `GET /api/play-sessions/active-live` — Polls for any active live session in the pair (Sub auto-detect)
- `PUT /api/play-sessions/:id/live` — Live session state updates (instruction, intensity, phase, end)
- `POST /api/rituals/:id/remind` — Trigger push notification reminder
- `GET /api/dashboard-init` — Batch endpoint fetching all dashboard data in one request; frontend `useDashboardInit()` hook seeds TanStack Query cache
- Reward Chest: `GET /api/rewards/chest`, `PATCH /api/rewards/:id/claim`, `PATCH /api/rewards/:id/redeem`
- Punishment Chest: `GET /api/punishments/chest`, `POST /api/punishments/stockpile`, `PATCH /api/punishments/:id/deploy`
- Sticker Board: `GET /api/sticker-board/:userId`
- Wager Voucher: `PATCH /api/wagers/:id` auto-creates reward voucher on win; `PATCH /api/rewards/:id` for editing voucher text (owner-only)
- Completion Notes: `completionNotes` field on tasks/dares/punishments/rewards, sent via PATCH on completion
- Notification Read: `PATCH /api/notifications/:id/read` marks notification as viewed; unread notifications glow/pulse, read ones dimmed

### Core Architectural Decisions
- **Command Center First**: Everything usable through Command Center. Dashboard shows only CommandProtocols.
- **Multi-Window Layout**: Command Center uses a CSS grid of 9 category windows with varied sizes (WINDOW_CONFIG), replacing the old flat feed.
- **Completion Notes**: Optional notes prompt on any task/punishment/dare completion, stored as `completionNotes` column.
- **Wager Vouchers**: Winning a wager auto-creates a reward voucher (isVoucher=true, wagerSourceId links back). Idempotent (checks existing voucher before creating).
- **Done Removes Item**: Completed tasks/dares/punishments/rewards filtered from active feed.
- **Role-Based Access Control**: `created_as_role` column on content tables tracks who created what; pair-based queries return all pair content (no role filtering on read).
- **Pair-Aware Data Sharing**: Most data endpoints fetch data relevant to both paired users.
- **Gamification Mechanics**: XP, leveling, dares, rewards, punishments, check-ins, streaks.
- **Dark Aesthetic**: All UI uses crimson/charcoal/black palette. Sub role = deep wine/burgundy.
- **PWA Support**: Manifest at `client/public/manifest.json` for home screen installation.
- **Media Handling**: Local file storage in `/uploads/` with `media` table for metadata.
- **Feature Toggles**: Dom users can enable/disable features for their sub.

## External Dependencies

- **PostgreSQL**: Primary database for application data and session storage.
- **Google Fonts**: Montserrat, Playfair Display, Inter for custom typography.
- **web-push**: Push notifications via VAPID keys.
