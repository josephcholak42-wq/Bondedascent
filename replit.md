# BondedAscent

## Overview

BondedAscent is a full-stack web application designed for dynamic protocol management between paired users, featuring a gamified system with XP tracking, leveling, dares, rewards, punishments, journaling, notifications, and activity logging. It supports two distinct user roles ("sub" and "dom") with role-based interfaces and interactions. The application aims to provide a comprehensive platform for managing structured relationships with an emphasis on gamification, detailed tracking, and customizable interactions, all within a dark, dramatic aesthetic. Key features include an interactive "Velvet Mode" with role-specific orbital interfaces, a central "Command Center" for all interactions, and an extensive system for prebuilt content and customizable protocols.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State/Data Fetching**: TanStack React Query
- **UI Components**: shadcn/ui (new-york style) built on Radix UI and Tailwind CSS v4
- **Styling**: Tailwind CSS, CSS variables for theming, custom fonts (Montserrat, Playfair Display, Inter)
- **Build Tool**: Vite
- **Key Components**:
    - **Velvet Mode**: Role-specific interactive dashboards with dynamic elements (e.g., rotating command words, devotion-pulse animation, compliance gauge, 3D Body Map).
    - **Command Center**: A central hub (`CommandProtocols` component) integrating all app functionalities, featuring expandable feed cards, pinning, global search, live activity timeline, sparkline trend charts, and bulk actions across 24 item types.
    - **Universal Creator**: A component (`UniversalCreator`) for creating various content types via a category picker grid and slash-command shortcuts.
    - **Feature Drawers**: Collapsible sections for quick access, sticker rewards, access control, crisis override, protocol/structure, scenes/trials, bond/reflection, and records/surveillance.
    - **Media Upload**: Polymorphic file attachment system with a reusable `<MediaUpload>` component.
    - **Sexy Icon System**: AI-generated photorealistic 3D-rendered BDSM-themed icons with animations, replacing standard vector icons.

### Backend
- **Framework**: Express 5 with Node.js and TypeScript
- **API Pattern**: RESTful JSON API (`/api/` prefix)
- **Authentication**: Passport.js with Local Strategy, session-based using `express-session` and `connect-pg-simple`.
- **Password Hashing**: Node.js `crypto.scrypt`.
- **Request Validation**: Zod schemas.
- **Development**: Vite dev server as middleware with HMR.

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with `drizzle-zod`.
- **Schema**: `shared/schema.ts` for shared client/server schema.
- **Storage Layer**: Abstracted via `IStorage` interface in `server/storage.ts`.

### Core Architectural Decisions
- **Role-Based Access Control**: `created_as_role` column on 32 content tables ensures data separation based on the user's role at creation. Read paths filter based on the viewing user's current role or partner's role for shared data.
- **Pair-Aware Data Sharing**: Most data endpoints fetch and display data relevant to both paired users.
- **Gamification Mechanics**: XP, leveling, dares, rewards, punishments, and check-ins drive user engagement.
- **Content Management**: Extensive prebuilt libraries for punishments, rewards, scenes, rituals, standing orders, wagers, devotions, limits, and desired changes, all filterable and searchable.
- **Dynamic Content Monetization**: Purchasable secrets, journal entries, and locked media using in-app currency (XP/sticker points).
- **Media Handling**: Local file storage for uploads in `/uploads/` with a `media` table for metadata.
- **Theming & Aesthetics**: Dark, dramatic aesthetic with red accents, custom fonts, and specific "Velvet Mode" visual enhancements.
- **User Feedback**: Web Audio API and haptic feedback for key interactions.
- **Feature Toggles**: Dom users can enable/disable features for their sub.

## External Dependencies

- **PostgreSQL**: Primary database for application data and session storage.
- **Google Fonts**: Montserrat, Playfair Display, Inter for custom typography.