# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lapsell is a demonstration app for the Shibaura Business Model Competition. It's a platform where creators sell future work time as "work slots," supporters bid on them, and creators record timelapse videos during work. After release, only winning bidders can view the videos.

This is a prototype built entirely in React as a single-page application with no backend. All data exists in browser memory and resets on reload.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Production build
npm run build

# Single-file build (for embedding in Figma or similar)
npm run build:single

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Tech Stack

- **React 19** + TypeScript
- **Vite 7** - Build tool
- **Tailwind CSS v4** - Styling with @tailwindcss/vite plugin
- **shadcn/ui** - UI component library (Radix UI-based)
- **Lucide React** - Icon library
- **Motion** (Framer Motion) - Animations
- **date-fns** - Date manipulation

## Architecture

### State Management

All application state is managed through React Context in `src/App.tsx`:

- `AppContext` provides global state including:
  - `workSlots` - Array of all work slots (auctions)
  - `currentUser` - Currently logged-in user (for demo switching)
  - `selectedCreator` - For creator detail view
  - Methods: `updateWorkSlot`, `addWorkSlot`, `placeBid`, `endAuction`, `startWork`, `completeWork`, `unlockVideo`, `getVideoUrl`, `getVideoSegment`, `switchUser`

### Navigation System

Navigation uses a screen-based routing system (no React Router):
- Screen types: `'home' | 'detail' | 'profile' | 'new-capsule' | 'settings' | 'creator-detail'`
- Navigation stack tracks history for back button functionality
- State variables: `currentScreen`, `previousScreen`, `screenStack`

### Core Data Models

**WorkSlot**: Represents an auction for creator work time
- Auction details: `title`, `creator`, `currentPrice`, `endTime`, `maxWinners`
- Bidding: `currentBids`, `winners`, `highestBidder`
- Work status: `auctionEnded`, `workInProgress`, `workCompleted`
- Video: `videoUrl`, `sampleVideoUrl`, `uploadedVideoFile`, `videoSegments`, `totalVideoDuration`
- Scheduled times: `workScheduledStartTime`, `workScheduledEndTime`

**VideoSegment**: Time-based video access for bidders
- `startTime`, `endTime`, `duration` (all in seconds)
- Allocated proportionally based on bid amounts
- Segments are randomly shuffled for fairness

### Component Structure

**Main Components** (`src/components/`):
- `CapsuleGrid.tsx` - Home screen with grid of work slots
- `CapsuleDetail.tsx` - Detailed view with bidding, video playback, creator actions
- `Profile.tsx` - User's purchased/listed work slots
- `NewCapsule.tsx` - Form to create new work slot listing
- `Settings.tsx` - User switching and demo instructions
- `CreatorDetail.tsx` - All work slots from specific creator
- `FloatingActionButton.tsx` - Bottom-right FAB with profile/new/settings actions
- `UserSwitcher.tsx` - Demo user account switching UI
- `AppBar.tsx` - Top navigation bar

**UI Components** (`src/components/ui/`):
- shadcn/ui components customized for this project
- Use `class-variance-authority` for variant management
- Styled with Tailwind CSS

**Figma Components** (`src/components/figma/`):
- Special components for Figma integration (if any)

### Video Segment Allocation

The app allocates video viewing rights proportionally to bid amounts:
- Function: `allocateVideoSegmentsByBids()` in `src/App.tsx`
- Higher bids get longer segments
- Segments are randomly ordered (Fisher-Yates shuffle) for fairness
- Each winner gets a sequential time slice of the video
- Default total duration: 3600 seconds (1 hour)

### Demo Users

Four pre-configured users for testing different perspectives:
- **クリエイターA** (`creator1`) - Creator role
- **ユーザーX** (`bidder1`) - Collector/bidder role
- **アーティストB** (`artist1`) - Creator role
- **新規ユーザー** (`newuser`) - New user with no activity

Switch users in Settings to see different ownership states.

## Vite Configuration

Custom Vite plugins in `vite.config.ts`:

1. **removeVersionSpecifiers**: Strips version numbers from imports (e.g., `@radix-ui/react-slot@1.1.2` → `@radix-ui/react-slot`)
2. **figmaAssetsResolver**: Resolves `figma:asset/` imports to `./src/assets/`
3. **viteSingleFile**: Bundles everything into single HTML file when `SINGLE_FILE=true`

## Styling Conventions

- **Mobile-first**: Design optimized for mobile, responsive for tablet/desktop
- **Tailwind CSS v4**: Use utility classes, avoid custom CSS when possible
- **Global styles**: Defined in `src/styles/globals.css` and `src/index.css`
- **Scrollbars**: Hidden globally for cleaner mobile UI
- **Typography**: Base styles set in globals.css

## Business Logic

### Auction Flow
1. Creator creates work slot with `maxWinners` (1-6 people)
2. Users place bids - sorted by amount, top N become winners
3. Creator ends auction - winners are locked in
4. Creator starts work (`workInProgress = true`)
5. Creator uploads video file (test feature uses File object)
6. Creator completes work - video becomes available
7. Creator unlocks video (`isUnlocked = true`)
8. Winners can view their allocated video segments

### Multiple Winner Support
- Set `maxWinners` on work slot (default: 1, max: 6)
- Top N bidders become winners
- Video segments allocated proportionally to bid amounts
- All winners get viewing rights to different time segments

### Video Handling
- Videos can be mock URLs (`/mock-video.mp4`) or uploaded File objects
- `getVideoUrl()` creates object URLs for uploaded files
- `getVideoSegment()` returns time bounds for current user's segment
- Video player should respect start/end times for non-creators

## Key Features

1. **Work Slot Auction**: Bidding system with real-time winner calculation
2. **Multiple Winners**: Up to 6 people can win same auction
3. **Video Segmentation**: Winners get time-proportional video access
4. **User Switching**: Demo mode to test different user perspectives
5. **Creator Tools**: Start work, upload video, complete work, unlock video
6. **Time-based UI**: Displays scheduled start/end times, shows "starting soon" states

## Important Notes

- This is a **demo/prototype** - no real payments or backend
- Data is **in-memory only** - refreshing page resets everything
- Video files are stored as File objects in state with object URLs
- All times use ISO 8601 format (`.toISOString()`)
- Work slots use relative timing from `appStartTime` for consistent demo experience
