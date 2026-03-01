# BondedAscent

## Overview

BondedAscent is a full-stack web application for dynamic protocol management between paired users. It features a gamified task/check-in system with XP tracking, leveling, dares, rewards, punishments, journaling, notifications, and activity logging. The app supports two user roles ("sub" and "dom") with role-based views and interactions. The UI has a dark, dramatic aesthetic with red accent colors, custom fonts (Montserrat, Playfair Display, Inter), and modes like "Velvet Mode" and "Crisis Mode."

### Velvet Mode (Enhanced)
- **Dom Velvet Mode**: Crown/Throne center with rotating command words (OBEY/SUBMIT/KNEEL/SERVE/YIELD), pulsing heartbeat glow, dark vignette overlay, floating ember particles, animated chain-flow SVG orbital ring. Orbital nodes renamed to: Command, Interrogate, Direct, Watch, Enforce, Permit, Sentence, Override. Features: partner presence indicator, compliance gauge bar, quick command input, demand timer with duration, lockdown toggle.
- **Sub Velvet Mode**: CircleDot/Collar center with devotion-pulse animation. Orbital nodes renamed to: Obey, Confess, Endure, Reflect, Serve, Earn, Sensory, Vault. Features: time since last command counter, demand timer response cards with urgency escalation, pending orders with acknowledge buttons.
- **Functional Features**: Demand timers (DB-backed with expiration), quick commands (instant push-notified orders), presence heartbeat (30s pings), lockdown mode (restricts sub to tasks only), compliance gauge.
- **Key Tables**: `demand_timers`, `quick_commands`, `presence_heartbeats`, `users.locked_down` field
- **Enforcement System**: Levels 1-5 with auto-task assignment, `users.enforcement_level` field
- **Override Actions**: Revoke rewards, clear tasks, force check-in (real backend operations)
- **Accusations**: Dom can make accusations, Sub responds. `accusations` table with from/to user tracking

### Role-Based Feature Pages
All 14 extra feature pages have dom/sub role differentiation:
- **Standing Orders**: Dom creates/manages, Sub views read-only
- **Permission Requests**: Sub creates requests, Dom approves/denies
- **Desired Changes**: Dom creates change requests, Sub views as "Required Changes"
- **Rituals**: Dom assigns rituals, Sub views and marks completion
- **Ratings**: Dom rates sub performance, Sub views received ratings
- **Wagers**: Dom proposes/resolves, Sub views only
- **Play Sessions**: Dom plans/completes, Sub views as "Scheduled Sessions"
- **Countdown Events**: Dom creates/deletes events, Sub views as "Upcoming Events"
- **Devotions**: Sub creates/completes, Dom views as "Sub's Devotions"
- **Secrets**: Dom sees "Secrets Vault", Sub sees "Confessions"
- **Conflicts**: Both create/discuss, only Dom resolves
- **Limits**: Both create/delete (shared safety feature)
- **Achievements**: Role-appropriate descriptions
- **Connection Pulse**: Role-appropriate activity labels

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management with a custom `apiRequest` helper and query function factory
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS v4
- **Styling**: Tailwind CSS via `@tailwindcss/vite` plugin, CSS variables for theming (dark mode by default), custom font families defined in `@theme`
- **Build Tool**: Vite with React plugin
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`, `@assets/` maps to `attached_assets/`

### Backend
- **Framework**: Express 5 running on Node.js with TypeScript (via tsx)
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Authentication**: Passport.js with Local Strategy, session-based auth using `express-session` with `connect-pg-simple` for PostgreSQL session storage
- **Password Hashing**: Node.js `crypto.scrypt` with random salt and timing-safe comparison
- **Request Validation**: Zod schemas for validating request bodies
- **Development**: Vite dev server runs as middleware in development mode with HMR support

### Data Storage
- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema Location**: `shared/schema.ts` — shared between client and server
- **Schema Push**: Use `npm run db:push` (runs `drizzle-kit push`) to sync schema to database
- **Key Tables**:
  - `users` — id (UUID), username, password, email, role (sub/dom), xp, level, partnerId
  - `tasks` — assignable tasks with completion tracking
  - `check_ins` — mood/obedience check-ins with approval workflow (pending/approved/rejected)
  - `dares` — randomly spun dares with completion tracking
  - `rewards` — unlockable rewards
  - `punishments` — punishments with status tracking
  - `journal_entries` — personal journal/reflection entries
  - `notifications` — dismissable notifications
  - `activity_log` — audit trail of user actions

### Storage Layer
- `server/storage.ts` defines an `IStorage` interface and a database-backed implementation using Drizzle queries
- All database operations go through the storage abstraction

### Role-Aware Data Separation
- **Column**: `created_as_role TEXT NOT NULL DEFAULT 'sub'` on 32 content tables (tasks, check_ins, dares, rewards, punishments, journal_entries, notifications, activity_log, rituals, limits, secrets, wagers, ratings, countdown_events, standing_orders, permission_requests, devotions, conflicts, desired_changes, achievements, play_sessions, accusations, demand_timers, quick_commands, intensity_sessions, obedience_trials, sensation_cards, sealed_orders, endurance_challenges, media, stickers, body_map_zones)
- **Defaults**: Most tables default to 'sub'; demand_timers, quick_commands, sealed_orders, endurance_challenges default to 'dom'
- **Write path**: All create routes in `server/routes.ts` set `createdAsRole: user.role` when inserting records
- **Read path**: All `ForPair()` storage methods accept optional `role` param; when provided, filter `WHERE created_as_role = role`. Single-user query methods (getNotifications, getJournalEntries, getActivityLog, getDemandTimers, getQuickCommands, getAccusations) also accept optional role param
- **Partner data**: Partner-specific routes (partner stats, partner activity, partner accusations) filter by `partner.role` (the partner's current role), not the viewer's role
- **Backfill**: Existing records were backfilled with `created_as_role = original_role` from the creating user's `original_role` field
- **Effect**: When a user switches roles (Dom ↔ Sub), they only see data created under their current role. Switching back reveals the original data

### Build & Deployment
- **Development**: `npm run dev` starts the Express server with Vite middleware for HMR
- **Production Build**: `npm run build` runs a custom build script that uses Vite for the client and esbuild for the server, outputting to `dist/`
- **Production Start**: `npm start` runs the compiled server from `dist/index.cjs`
- **Static Serving**: In production, the Express server serves the built client from `dist/public/` with SPA fallback

### Auth Flow
- `POST /api/auth/register` — create account with username, password, role
- `POST /api/auth/login` — authenticate with username/password
- `POST /api/auth/logout` — end session
- `GET /api/auth/me` — get current user (returns 401 if not authenticated)
- Protected routes use a `requireAuth` middleware that checks `req.isAuthenticated()`

### API Routes
All under `/api/`:
- Tasks: CRUD operations for task management
- Check-ins: Create, list, and review (approve/reject with XP)
- Dares: Spin random dare, complete dare
- Rewards: Create and toggle rewards
- Punishments: Create and update status
- Journal: Create and list entries
- Notifications: Create, list, dismiss
- Activity Log: List user activity

### Pair-Aware Data Sharing
All data endpoints fetch data for both paired users (not just the logged-in user). Routes use `getPartner()` to resolve the pair, then query with both user IDs via `inArray()`. Affected: tasks, check-ins, dares, rewards, punishments, achievements, activity log, standing orders, rituals, wagers, etc.

### New Features (Feb 2026)
- **Media Upload**: Polymorphic file attachment system. Files stored in `/uploads/` directory, referenced via `media` table with entityType/entityId pattern. Supports images and videos up to 50MB. Reusable `<MediaUpload>` component.
- **Sticker Rewards**: Dom can send emoji stickers (8 types: gold-star, heart, fire, crown, diamond, ribbon, trophy, sparkle) with optional messages to Sub. Sub sees received stickers on dashboard.
- **Feature Toggles**: Dom controls which features are accessible to Sub via `feature_settings` table. Toggle UI on Dom dashboard. Sub-side gating via `useIsFeatureEnabled()` hook.
- **Prebuilt Libraries**: Curated catalogs for punishments (140+ items, 8 categories), rewards (140+ items, 8 categories), and scenes (100+ items, 8 categories). Each with searchable/filterable browser UI, category pills, one-tap assignment, and custom entry fallback. Files: `prebuilt-punishments.ts`, `prebuilt-rewards.ts`, `prebuilt-scenes.ts`.
- **Scene Categories**: Bondage, Impact Play, Sensory, Roleplay, Service, Worship, Discipline, Edge Play
- **3D Body Map (Map of Desire)**: Interactive Three.js wireframe human model in Dom Velvet Mode. Long-press zones for golden glow (desire), double-tap for translucent void (off-limits). Features: 360-degree orbit controls, bloom post-processing, haptic feedback, share/reset buttons. Lazy-loaded for performance. Component: `body-map-3d.tsx`. Replaces the old Command orbital node.
- **Sexy Icon System**: AI-generated photorealistic 3D-rendered BDSM-themed icons (30 icons) replace Lucide vector icons across the dashboard. Icons stored in `client/public/icons/` (Vite public directory). Reusable `<SexyIcon>` component (`client/src/components/sexy-icon.tsx`) with hover float/glow, tap bounce, and long-press throb animations. CSS animations in `client/src/index.css`. Supports `prefers-reduced-motion`. Fallback to Lucide icons when images fail to load.
- **Key Tables**: `media`, `stickers`, `feature_settings`, `body_map_zones`

### New Features (Mar 2026)
- **Command Center (ActionFeed)**: Unified action feed on both Dom and Sub dashboards (`client/src/components/action-feed.tsx`). Color-coded cards for demands (red), commands (orange), accusations (rose), tasks (blue), punishments (dark-red), rewards (amber), dares (fuchsia), check-in reviews (purple), notifications (slate). Filter pills (All/Urgent/Tasks/Rewards/Info), inline action buttons, countdown timers for demands.
- **Sticker Economy**: Stickers now have point values (gold-star=5, heart=3, fire=4, crown=10, diamond=15, ribbon=2, trophy=8, sparkle=1). `sticker_balance` field on users tracks total sticker points. `POST /api/stickers/spend` route for purchasing content.
- **Purchasable Secrets**: `xp_cost` column on secrets table. Partner can spend XP to reveal secrets. Dom reveals for free. Blurred preview with price tag.
- **Purchasable Journal Entries**: `is_shared`, `unlock_cost`, `unlocked_by` columns on journal_entries. Users can share entries; partner pays XP/sticker points to read. `POST /api/journal/:id/unlock` route.
- **Locked Media Gallery**: `is_locked`, `unlock_cost`, `unlocked_by` columns on media table. New page at `/locked-media`. Upload locked photos/videos with XP price. Blurred thumbnails for locked items. `POST /api/media/locked` and `POST /api/media/:id/unlock` routes.
- **Prebuilt Libraries (Extended)**: New prebuilt catalogs for rituals (100+ items, 8 categories), standing orders (100+ items, 8 categories), wagers (80+), devotions (80+), limits (85+), desired changes (80+). Files: `prebuilt-rituals.ts`, `prebuilt-standing-orders.ts`, `prebuilt-wagers.ts`, `prebuilt-devotions.ts`, `prebuilt-limits.ts`, `prebuilt-desired-changes.ts`.
- **3D Body Map Improvements**: Expanded zone definitions (20+ zones), improved touch detection, press-and-hold progress ring animation, zone labels on hover/touch, increased double-tap window (500ms), iOS haptic fallback.
- **Profile Pictures**: Users can upload profile pictures via clickable avatar circles on the dashboard. Stored in `/uploads/` directory, referenced by `profile_pic` column on `users` table. `POST /api/profile-pic` route. Partner's profile pic shown in pair view. Camera overlay on hover.

## External Dependencies

- **PostgreSQL**: Primary database, required via `DATABASE_URL` environment variable. Used for both application data (via Drizzle ORM) and session storage (via `connect-pg-simple`)
- **Google Fonts**: Montserrat, Playfair Display, and Inter loaded via Google Fonts CDN in `index.html`
- **Replit Plugins**: Optional Vite plugins for Replit environment (`@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`) — only active in development on Replit