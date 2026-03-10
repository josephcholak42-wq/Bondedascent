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
- **Multi-Window Layout**: The Command Center features a CSS grid with 9 distinct category windows, each with varied sizes, specific color-coded borders/glow, and scrollable content areas.
- **Role-Based Access Control**: Content access and creation are managed through `created_as_role` on content tables, ensuring appropriate data visibility for "sub" and "dom" users.
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
    - **Command Center**: Multi-window layout with 9 category panels, expandable feed cards, global search, live activity timeline, sparkline trend charts, bulk actions, level-gated feature locks, and adjustable window sizing/ordering (5 size presets: compact/standard/tall/wide/large, with reorder controls and localStorage persistence).
    - **Live Session Engine**: Full-screen immersive session mode with Dom control and Sub receiver views, intensity effects, phase management, and safe word support.
    - **Interrogation Mode**: Dom setup, Sub Q&A, and results.
    - **Confession Booth**: Sub typing and Dom review/response.
    - **Aftercare Checklist**: Post-session checklist.
    - **Auto-Dom Simulation**: AI-driven task generation at varying intensities and roles.
    - **Reward/Punishment Chests**: UI for managing rewards and punishments.
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
- **Authentication**: Passport.js with Local Strategy, session-based (`express-session`, `connect-pg-simple`).
- **Password Hashing**: Node.js `crypto.scrypt`.
- **Request Validation**: Zod schemas.
- **Push Notifications**: `web-push` with VAPID keys.
- **Server-Sent Events**: Real-time partner sync for various features.
- **Unlock Registry**: Feature unlock map linked to user levels.
- **Data Storage**: PostgreSQL with Drizzle ORM.
- **Media Handling**: Local file storage and metadata management.
- **Admin System**: Master admin panel at `/admin` for FuckKingMasterCock (isAdmin=true). Global restriction toggles, maintenance mode, user surveillance, per-user level overrides. Admin sticker library (25+ BDSM themed) and trinket library (15+ across rarity tiers). Tables: `adminSettings`, `adminStickers`, `trinkets`, `userTrinkets`. Routes under `/api/admin/*` with `requireAdmin` middleware. Frontend restrictions toggle via `GET /api/restrictions-status` + `useRestrictionsStatus` hook.

## External Dependencies

- **PostgreSQL**: Primary database.
- **Google Fonts**: Montserrat, Playfair Display, Inter for custom typography.
- **web-push**: For push notification functionality.