# FitForge — Progressive Web App (PWA) & Offline Gym Engine Guide

This document describes the architecture, installation experience, service worker caching strategy, IndexedDB offline workout persistence, and multi-user privacy isolation implemented for the **FitForge** Progressive Web App.

---

## 1. Web App Manifest & App Icons

### Web App Manifest (`src/app/manifest.ts`)
FitForge uses Next.js App Router's typed metadata route to serve `/manifest.webmanifest`:

```typescript
{
  "name": "FitForge — Gym Fitness Tracker",
  "short_name": "FitForge",
  "description": "Track workouts, exercises, strength progression, and fitness goals.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#0A0D0F",
  "background_color": "#0A0D0F",
  "icons": [ ... ]
}
```

### Application Icons (`public/icons/` & `public/`)
Generated via `scripts/generate-icons.js` matching FitForge's dark charcoal (`#0A0D0F`) background and electric-lime (`#D4FF00`) barbell/forge emblem:
- `icon-192x192.png`: Standard Android home screen and app switcher icon.
- `icon-512x512.png`: High-resolution splash screen and store icon.
- `icon-maskable-192x192.png`: Adaptive icon with 15% safe padding for circular, squircle, or rounded-rect Android icons.
- `icon-maskable-512x512.png`: High-res adaptive maskable icon.
- `apple-touch-icon.png` (180×180): High-resolution icon for iOS Safari "Add to Home Screen".
- `favicon.png` (32×32): Browser tab favicon.
- `icon.svg`: Scalable vector emblem with glow filter.

---

## 2. Installation Experience

FitForge detects installation state through the `usePwa()` context hook (`src/lib/pwa/PwaProvider.tsx`):

### Supported Browsers (Chrome, Edge, Samsung Internet, Android)
1. Captures `beforeinstallprompt` event and delays the prompt until explicit user interaction.
2. Displays a sleek, dismissible **`PwaInstallBanner`** at the top of the interface.
3. Provides an **"Install App"** button in both the header and the **Settings & Preferences** page.
4. When clicked, calls `prompt()` and handles both accepted and dismissed states gracefully.
5. Listens for `appinstalled` event to instantly update state to `installed` and hide all banners.

### iOS Safari Experience
1. Detects iOS devices (`/iPad|iPhone|iPod/`).
2. Displays a tailored **"How to Install (iOS)"** trigger.
3. Opens the **`IosInstallModal`** with 3 clear visual steps:
   - Tap Share (`⎋`) in Safari's bottom toolbar.
   - Select `Add to Home Screen` (`[+]`).
   - Tap `Add` in the top right corner.

### Standalone Detection
Detects when FitForge is launched in standalone mode:
- `window.matchMedia('(display-mode: standalone)').matches`
- `navigator.standalone === true`
When running in standalone mode, all installation prompts are automatically hidden.

---

## 3. Service Worker & Caching Strategy (`public/sw.js`)

FitForge implements a production-grade service worker with cache versioning (`fitforge-v1.0.0`):

| Resource Type | Strategy | Cache Name |
| :--- | :--- | :--- |
| **HTML Navigation Requests** (`/`, `/workouts`, etc.) | **Network-First** (Falls back to cache, then `/offline`) | `fitforge-shell-v1.0.0` |
| **Next.js Static Assets** (`/_next/static/*`) | **Stale-While-Revalidate** | `fitforge-static-v1.0.0` |
| **Google Fonts & Webfonts** (`fonts.gstatic.com`) | **Cache-First** | `fitforge-fonts-v1.0.0` |
| **Images & Icons** (`/icons/*`, SVGs, PNGs) | **Stale-While-Revalidate** | `fitforge-static-v1.0.0` |
| **Offline Fallback Page** (`/offline`) | **Pre-cached** at install | `fitforge-shell-v1.0.0` |

### Security & Privacy Isolation (Zero Leakage)
To prevent cross-user data leakage and maintain strict privacy:
1. **Never Caches Authentication Endpoints**:
   - Explicitly bypasses `/auth/*`, `/api/auth/*`, and OAuth token exchanges.
2. **Never Caches Supabase Database Requests**:
   - Requests to `*.supabase.co`, `/rest/v1/*`, and `/realtime/v1/*` bypass the cache directly to the network.
3. **Never Caches Authenticated Responses**:
   - Any request with an `Authorization` header is excluded from HTTP caches.
4. **Mutations Excluded**:
   - `POST`, `PUT`, `DELETE`, and `PATCH` requests are never cached.

---

## 4. Offline Workout Experience (Gym Connectivity Engine)

Gyms frequently have dead zones or spotty Wi-Fi. FitForge allows lifters to continue recording workouts completely offline.

### IndexedDB Persistence (`src/lib/pwa/offlineSync.ts`)
- **Database**: `fitforge_offline_store`
- **Store 1: `pending_workout_sync`**:
  - Stores each set change, set completion, and session completion with an idempotent sync ID (`sync-set-${sessionId}-${setId}-${timestamp}`).
  - Scoped strictly by `user_id` to prevent cross-account visibility.
- **Store 2: `active_sessions_backup`**:
  - Live backup snapshot of active session data.

### Auto-Sync & Manual Sync
1. Listens for `window.addEventListener('online')`.
2. When connectivity returns, `syncPendingWorkoutQueue()` automatically executes idempotent upserts to Supabase tables (`workout_sets`, `workout_sessions`).
3. If a network error occurs, retry counters increment without discarding pending changes.
4. A manual **"Sync Now"** button is provided in `ActiveWorkoutPage`, `Header`, and `SettingsPage`.

### Strict Multi-User Isolation on Shared Devices
When a user logs out (`logout()` in `fitnessStore.tsx`):
- Calls `clearUserOfflineData(user.id)`, which purges all queued sets and session backups belonging to that user from IndexedDB.
- Prevents another user logging into the same phone from ever viewing the previous user's unsynced workout data.

---

## 5. Mobile-First Gym Optimizations

1. **Accidental Navigation Prevention**:
   - Binds `beforeunload` event during active workouts (`activeWorkout !== null`) to warn the lifter before leaving or closing the tab.
2. **Visual Set Feedback**:
   - Completed sets in `ActiveSetRow` display a subtle badge:
     - `Cloud Synced` (when online)
     - `HardDrive Local` (when recorded offline in IndexedDB)
3. **Safe-Area Insets**:
   - Configured `viewportFit: "cover"` in `layout.tsx`.
   - CSS in `globals.css` accounts for iPhone notches and Android home gesture bars with `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
4. **Accessibility & Reduced Motion**:
   - Honors `@media (prefers-reduced-motion: reduce)` by disabling non-essential transitions.

---

## 6. Version Updates & Safe Reloading

1. The service worker listens for `updatefound` and `statechange` to detect when a new deployment is waiting.
2. `UpdateAvailableToast` notifies the lifter: *"A new version of FitForge is available. [Update Now]"*.
3. **Workout Protection**: Before applying the update (`SKIP_WAITING`), it verifies whether an active workout is in progress and requests confirmation so no sets are lost.

---

## 7. Vercel Deployment Compatibility

- Standard static assets in `public/` (`public/sw.js`, `public/icons/*`).
- Manifest dynamically served by Next.js App Router (`src/app/manifest.ts`).
- Compatible with HTTPS-enforced Vercel production and preview deployments.
