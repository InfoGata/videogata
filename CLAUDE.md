# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
# Install dependencies
npm install

# Run development server with CORS proxy
npm run dev

# Lint the codebase
npm run lint

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview

# Start CORS proxy server only
npm run cors-server
```

### Platform-specific builds

```bash
# Run Electron development
npm run electron:dev

# Build Electron app
npm run electron:build

# Preview Electron app
npm run electron:start

# Build and run for Android
npm run android
```

## Architecture

VideoGata is a plugin-based web application that plays videos from different platforms. Each plugin runs in a sandboxed iframe using [plugin-frame](https://github.com/elijahgreen/plugin-frame), with each plugin operating on its own subdomain.

### Key Components:

1. **Plugin System**: 
   - Uses `plugin-frame` to load and execute plugins in sandboxed iframes
   - `PluginsContext.tsx` defines the plugin interface
   - `PluginsProvider.tsx` implements the plugin lifecycle (loading, communication, updates)
   - Plugins are stored in IndexedDB using Dexie.js

2. **Data Flow**:
   - Redux is used for state management (see `src/store`)
   - Plugins communicate through a bridge defined in `ApplicationPluginInterface`
   - Video/playlist data is normalized with IDs and stored in Redux and IndexedDB

3. **UI Components**:
   - Built with React and Tailwind CSS using shadcn/ui components
   - Uses react-i18next for internationalization
   - Responsive design with mobile sidebar and desktop navigation

4. **Offline Support**:
   - Service worker (`sw.ts`) handles caching and HLS (.m3u8/.ts) proxying
   - `useUpdateServiceWorker` hook manages service worker updates

5. **Multi-platform**:
   - Web (primary platform)
   - Desktop via Electron
   - Mobile via Capacitor (Android)

### Plugin API

Plugins implement the `PluginMethodInterface` and can:
- Search for videos, playlists, channels
- Parse URLs to get video/playlist information
- Provide custom video players
- Handle authentication with source platforms
- Access CORS proxies when needed

### Folder Structure

- `src/components`: React components
- `src/hooks`: Custom React hooks
- `src/providers`: Context providers
- `src/routes`: Router components (using TanStack Router)
- `src/store`: Redux store and reducers
- `src/layouts`: Layout components
- `src/locales`: Internationalization files