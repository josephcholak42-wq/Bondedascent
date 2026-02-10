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
- **Key Tables**: `media`, `stickers`, `feature_settings`

## External Dependencies

- **PostgreSQL**: Primary database, required via `DATABASE_URL` environment variable. Used for both application data (via Drizzle ORM) and session storage (via `connect-pg-simple`)
- **Google Fonts**: Montserrat, Playfair Display, and Inter loaded via Google Fonts CDN in `index.html`
- **Replit Plugins**: Optional Vite plugins for Replit environment (`@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`) — only active in development on Replit