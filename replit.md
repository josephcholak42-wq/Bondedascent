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

### Core Architectural Decisions
- **Command Center First**: All application functionality is accessible through the Command Center, which serves as the primary user interface.
- **Multi-Window Layout**: The Command Center features a CSS grid with 7 category windows (URGENT, DIRECTIVES, SCENES, PARTNER WATCH, CONNECTION, STRUCTURE, JOURNAL), each with varied sizes, specific color-coded borders/glow, and scrollable content areas. Dares in SCENES window. Achievements/stickers in CONNECTION window.
- **Consequence Spirits**: Two animated floating icons on the dashboard — a hyper-realistic devil (left, blood red) for punishments and a hyper-realistic angel (right, dark gold) for rewards. Both animate with motion when there is activity (bobbing, floating, blinking, wing/tail movement). Badge count shows active items. Click navigates to punishment/reward views. Component: `client/src/components/consequence-spirits.tsx`.
- **Profile Types**: Each role has two switchable profile types. Dom role → "Master" or "Sub". Sub role → "Sub" or "Mistress". Stored in `users.profileType`, switchable from dashboard profile area. Route: `PATCH /api/profile-type`.
- **Partner Activity Notifications**: Dedicated `partner_activity` notification type with Eyes Wide Shut mask icon, shown in PARTNER WATCH window. Triggers on: task completion, check-in, dare completion, journal entry, ritual completion, reward claim/redeem, punishment status change, confession, live session start.
- **Role-Based Access Control**: Content access and creation are managed through `created_as_role` on content tables, ensuring appropriate data visibility for "sub" and "dom" users. **Exception**: Rewards and punishments are role-neutral — both dom and sub can create, assign, view, complete, and manage them. Reward/punishment data persists across profile type switches (Master↔Sub).
- **Pair-Aware Data Sharing**: Most data endpoints are designed to fetch and display information relevant to both paired users.
- **Gamification Mechanics**: The application incorporates XP, leveling, dares, rewards, punishments, check-ins, streaks, altar cycles, and relics to drive user engagement.
- **Dark Aesthetic**: The UI adheres strictly to a dark color palette, predominantly crimson, charcoal, and black, with a deep wine/burgundy theme for the "sub" role.
- **PWA Support**: The application is designed to be installable on home screens via a manifest file.
- **Feature Toggles**: Dom users have the ability to enable or disable specific features for their sub.
- **Ascension Path**: Features are progressively unlocked based on user levels (1, 3, 5, 7, 10, 15), with corresponding UI lock overlays and backend authorization.
- **Tether Engine**: A scheduled system running every 15 minutes for real-time checks including streak warnings, silence detection, ritual reminders, missed ritual accountability, and weekly tribunal generation.
- **Auto-Streak Recording**: Streaks are automatically recorded upon completion of tasks, check-ins, journal entries, and rituals, with partner notifications for streak breaks.

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State/Data Fetching**: TanStack React Query
- **UI Components**: shadcn/ui (new-york style) built on Radix UI and Tailwind CSS v4
- **Styling**: Tailwind CSS, CSS variables for theming, custom fonts (Montserrat, Playfair Display, Inter)
- **Real-time Interactions**: Server-Sent Events (SSE) for partner-synced features like Live Sessions, Interrogation Mode, Confession Booth, and Whisper Chamber.
- **Key Features**:
    - **Command Center**: Multi-window layout with 7 category panels (URGENT, DIRECTIVES, SCENES, PARTNER WATCH, CONNECTION, STRUCTURE, JOURNAL), expandable feed cards, global search, live activity timeline, sparkline trend charts, bulk actions, level-gated feature locks, and adjustable window sizing/ordering (5 size presets: compact/standard/tall/wide/large, with reorder controls and localStorage persistence). DIRECTIVES window shows only one-off tasks; rituals/standing orders moved to Protocol Scroll. Punishments and rewards are separate Consequence Panels above the CC.
    - **Protocol Scroll**: 3D scroll-styled section above the Command Center showing all daily/weekly/monthly rituals and standing orders organized by frequency, with completion tracking, streak indicators, and bronze/ember aesthetic. Component: `client/src/components/protocol-scroll.tsx`.
    - **Live Session Engine**: Full-screen immersive session mode with Dom control and Sub receiver views, intensity effects, phase management, and safe word support.
    - **Interrogation Mode**: Dom setup, Sub Q&A, and results.
    - **Confession Booth**: Sub typing and Dom review/response.
    - **Aftercare Checklist**: Post-session checklist.
    - **Auto-Dom Simulation**: AI-driven task generation at varying intensities and roles.
    - **Reward/Punishment Chests**: UI for managing rewards and punishments.
    - **Rewards Arsenal**: Dark gold/bronze themed stockpile for pre-built and custom rewards with library browser, category filtering, search, and one-click deploy to partner. Component: `client/src/components/reward-arsenal.tsx`.
    - **Sticker Board**: Three-tab corkboard (realistic wood frame, cork texture, pushpin/tape graphics, paper shadows) for Dom notes, achievements, and documents. Doubled in visual size.
    - **Devotion Flames**: Visual streak system with animated flame levels.
    - **Whisper Chamber**: Dark, themed messaging overlay with real-time delivery and special message features.
    - **Daily Altar**: 7-day reward cycle with a "Kneel" button and escalating rewards.
    - **Ascension Path**: Visual progression tree for feature unlocks with level-up animations.
    - **Tribunal**: Cinematic weekly performance review with stats, Dom verdict, and Sub plea.
    - **Sensory Feedback**: Web Audio API for synthesized sounds and haptic vibrations for in-app events.

### Backend
- **Framework**: Express 5 with Node.js and TypeScript
- **API Pattern**: RESTful JSON API
- **Authentication**: Passport.js with Local Strategy, session-based (`express-session`, `connect-pg-simple`). Also supports API key authentication via `Authorization: Bearer ba_xxx` or `X-API-Key: ba_xxx` headers for external agent/bot access.
- **API Key System**: Table `api_keys` with SHA-256 hashed keys, prefix-based lookup, scopes, expiry, and revocation. Routes: `GET/POST /api/api-keys`, `DELETE /api/api-keys/:id`. Middleware in `server/api-key-auth.ts` runs on all `/api` routes before session auth.
- **OpenAPI Spec**: Machine-readable API documentation at `GET /api/openapi.json` (OpenAPI 3.1.0) covering all major endpoints with auth schemes. Source: `server/openapi.ts`.
- **CORS**: Enabled for all origins on `/api` routes to support external AI agent access. Configured in `server/index.ts`.
- **Password Hashing**: Node.js `crypto.scrypt`.
- **Request Validation**: Zod schemas.
- **Pre-Built Libraries**: Extensive pre-built content libraries for quick content creation:
  - `prebuilt-obedience-trials.ts`: 20 obedience trials across 8 categories (Protocol, Service, Discipline, Posture, Verbal, Endurance, Precision, Devotion)
  - `prebuilt-endurance.ts`: 20 endurance challenges across 8 categories (Physical, Mental, Denial, Service, Silence, Exposure, Devotion, Survival)
  - `prebuilt-scene-steps.ts`: 12 step-by-step scene scripts across 8 categories (Bondage, Impact, Sensory, Power Exchange, Worship, Discipline, Edge Play, Roleplay)
  - `prebuilt-training-programs.ts`: 8 training programs (foundations, service, discipline, endurance, mindset, intimacy, obedience, advanced)
  - Also existing: prebuilt-scenes, prebuilt-rituals, prebuilt-rewards, prebuilt-punishments, prebuilt-wagers, prebuilt-standing-orders, prebuilt-sensations, prebuilt-desired-changes, prebuilt-limits, prebuilt-devotions
- **Push Notifications**: `web-push` with VAPID keys.
- **Server-Sent Events**: Real-time partner sync for various features.
- **Unlock Registry**: Feature unlock map linked to user levels.
- **Data Storage**: PostgreSQL with Drizzle ORM.
- **Media Handling**: Local file storage and metadata management.
- **Admin System**: Master admin panel at `/admin` for FuckKingMasterCock (isAdmin=true). Global restriction toggles, maintenance mode, user surveillance, per-user level overrides. Admin sticker library (175 BDSM themed across 11 categories: obedience, discipline, praise, tasks, intimacy, endurance, rituals, attitude, scenes, communication, special) and trinket library (52 across 5 rarity tiers with 3D trophy display, each with unique profile customization effect: border/badge/nameColor/glow). Tables: `adminSettings`, `adminStickers`, `trinkets`, `userTrinkets`. Routes under `/api/admin/*` with `requireAdmin` middleware. Frontend restrictions toggle via `GET /api/restrictions-status` + `useRestrictionsStatus` hook.

## External Dependencies

- **PostgreSQL**: Primary database.
- **Google Fonts**: Montserrat, Playfair Display, Inter for custom typography.
- **web-push**: For push notification functionality.