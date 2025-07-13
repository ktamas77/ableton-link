# @ktamas77/abletonlink

Node.js native bindings for Ableton Link - Real-time music synchronization

## Overview

This package provides a TypeScript/Node.js wrapper around the native Ableton Link C++ SDK to expose tempo sync functionality in JavaScript.

## Features

- **Tempo Synchronization**: Get/set tempo (BPM) across connected peers
- **Beat & Phase Information**: Query beat position and phase for quantized synchronization
- **Transport Control**: Start/stop playback state synchronization
- **Peer Discovery**: Automatic discovery of Link-enabled applications on the network
- **Quantum Support**: Beat subdivision for perfect loop synchronization
- **TypeScript Support**: Full type definitions for a great developer experience

## Installation

```bash
npm install @ktamas77/abletonlink
```

Note: This package includes native bindings and will be compiled during installation.

## Usage

```typescript
import { AbletonLink } from '@ktamas77/abletonlink';

// Create a new Link instance with initial tempo
const link = new AbletonLink(120.0);

// Enable Link
link.enable(true);

// Enable start/stop sync to synchronize transport state
link.enableStartStopSync(true);

// Get current tempo
console.log('Current tempo:', link.getTempo());

// Set new tempo
link.setTempo(128.0);

// Get number of connected peers
console.log('Connected peers:', link.getNumPeers());

// Query beat information
const beat = link.getBeat();
const phase = link.getPhase(4.0); // 4-beat quantum

// Transport control
link.setIsPlaying(true);
console.log('Is playing:', link.isPlaying());

// Set up callbacks for real-time notifications
link.setNumPeersCallback((numPeers) => {
  console.log(`Peers changed: ${numPeers}`);
});

link.setTempoCallback((tempo) => {
  console.log(`Tempo changed: ${tempo} BPM`);
});

link.setStartStopCallback((isPlaying) => {
  console.log(`Playing state: ${isPlaying}`);
});
```

## Examples

The `examples/` directory contains several scripts demonstrating different features:

### basic.js

A simple example showing core Link functionality including tempo sync, beat/phase tracking, and transport control. Great starting point for understanding the basics.

### callbacks.js

Demonstrates the callback system for real-time notifications when peers connect/disconnect, tempo changes, or transport starts/stops. Shows how to build reactive applications.

### quantized-launch.js

Advanced example showing quantized beat alignment and synchronized starts. Essential for DAW-like applications that need sample-accurate synchronization with other Link peers.

### auto-tempo.js

Shows how to automatically adopt the tempo from an existing Link session. Useful for applications that want to immediately sync with whatever session is already running.

### monitor-playing.js

Real-time monitor for the isPlaying state. Shows current play/stop status, tempo, beat position, and detects state changes. Useful for debugging transport synchronization issues.

### diagnose-playing.js

Diagnostic tool that checks all prerequisites for isPlaying functionality including start/stop sync, network connectivity, and peer discovery. Provides troubleshooting hints if synchronization isn't working.

### diagnose-playing-sync.js

Advanced diagnostic that analyzes the synchronization sequence when joining a session, helping identify timing issues with play state synchronization.

### sync-with-playing.js

Shows how to properly wait for initial synchronization when joining a Link session that may already be playing.

### join-playing-session.js

Best practices example demonstrating the recommended initialization sequence for reliable synchronization with existing Link sessions.

### test-initial-sync.js

Tests various timing scenarios for enableStartStopSync to understand synchronization behavior.

### force-sync-workaround.js

Demonstrates workarounds to force synchronization when joining a session that's already playing.

### typescript-example.ts

Demonstrates TypeScript usage with full type safety and autocompletion support.

Run any example with:

```bash
node examples/basic.js
```

## API Reference

### `new AbletonLink(bpm: number)`

Creates a new Ableton Link instance with the specified initial tempo.

### `enable(enabled: boolean): void`

Enable or disable Link synchronization.

### `isEnabled(): boolean`

Check if Link is currently enabled.

### `getTempo(): number`

Get the current tempo in BPM.

### `setTempo(bpm: number): void`

Set a new tempo in BPM.

### `getNumPeers(): number`

Get the number of connected Link peers.

### `getBeat(): number`

Get the current beat position.

### `getPhase(quantum: number): number`

Get the current phase for the given quantum (beat subdivision).

### `isPlaying(): boolean`

Check if transport is playing.

**Important:** Start/stop sync must be enabled with `enableStartStopSync(true)` for this method to work correctly. Without start/stop sync, Link only synchronizes tempo and beat position, not play/stop state.

**Note on synchronization:** When joining a Link session that's already playing, there may be a brief delay before the play state synchronizes. The initial state will be "stopped" until the Link protocol completes synchronization. Use the start/stop callback to be notified when the state updates. See the `join-playing-session.js` example for best practices.

### `setIsPlaying(playing: boolean): void`

Start or stop transport playback.

### `enableStartStopSync(enabled: boolean): void`

Enable or disable start/stop synchronization with other Link peers. When enabled, play/stop state changes will be synchronized across all connected applications.

### `isStartStopSyncEnabled(): boolean`

Check if start/stop synchronization is enabled.

### `forceBeatAtTime(beat: number, time: number, quantum: number): void`

Force a specific beat at a specific time with the given quantum.

### `setNumPeersCallback(callback: (numPeers: number) => void): void`

Register a callback to be notified when the number of connected peers changes.

### `setTempoCallback(callback: (tempo: number) => void): void`

Register a callback to be notified when the tempo changes.

### `setStartStopCallback(callback: (isPlaying: boolean) => void): void`

Register a callback to be notified when the play/stop state changes.

### `requestBeatAtTime(beat: number, time: number, quantum: number): void`

Request a specific beat to occur at a specific time. When connected to peers, this will quantize to the nearest quantum boundary for synchronized starts.

### `requestBeatAtStartPlayingTime(beat: number, quantum: number): void`

Request a specific beat (usually 0) when transport starts playing. Useful for resetting the beat counter on playback start.

### `setIsPlayingAndRequestBeatAtTime(isPlaying: boolean, time: number, beat: number, quantum: number): void`

Combined operation to start/stop playback and align beats at a specific time. Perfect for synchronized launches.

### `timeForIsPlaying(): number`

Get the time when the transport will start or stop. Returns the scheduled time in seconds.

## Implementation Plan

### Components

- **Ableton Link SDK (C++)** – Official synchronization engine from Ableton
- **Node.js Native Addon** – C++ bridge to expose Link functionality to JS/TS
- **node-gyp** – Build system for compiling the native module
- **TypeScript Definitions** – Clean and typed API exposed to the user

### Project Structure

```
abletonlink/
├── src/                      # C++ source files
│   ├── abletonlink.cc       # Main addon implementation
│   └── abletonlink.h        # Header file
├── examples/                 # Example scripts
│   ├── basic.js             # Basic usage example
│   ├── callbacks.js         # Demonstrates callback functionality
│   ├── quantized-launch.js  # Shows quantized launch features
│   ├── auto-tempo.js        # Auto-adopt tempo from session
│   ├── monitor-playing.js   # Real-time isPlaying monitor
│   ├── diagnose-playing.js  # Diagnose transport sync issues
│   ├── diagnose-playing-sync.js # Analyze sync sequence
│   ├── sync-with-playing.js # Handle already-playing sessions
│   ├── join-playing-session.js # Best practices for joining
│   ├── test-initial-sync.js # Test sync timing scenarios
│   ├── force-sync-workaround.js # Workarounds for sync issues
│   └── typescript-example.ts # TypeScript usage example
├── test/                     # Test files
│   ├── abletonlink.test.js  # Main test suite
│   └── link.test.js         # Additional tests
├── build/                    # Compiled native module (generated)
├── link/                     # Ableton Link SDK (git submodule)
├── .husky/                   # Git hooks
│   └── pre-commit           # Runs prettier and tests
├── binding.gyp              # node-gyp build configuration
├── index.js                 # Main entry point
├── index.d.ts               # TypeScript definitions
├── package.json             # NPM package configuration
├── tsconfig.json            # TypeScript configuration
├── jest.config.js           # Jest test configuration
├── .prettierrc.json         # Prettier code formatting config
├── .prettierignore          # Files to ignore for formatting
└── README.md                # This file
```

### Building from Source

1. Clone the repository with submodules:

```bash
git clone --recursive https://github.com/ktamas77/ableton-link.git
cd ableton-link
```

2. Install dependencies:

```bash
npm install
```

3. Build the native addon:

```bash
npm run build
```

## Publishing to npm

To publish this package to npm:

1. **Make sure you're logged in to npm:**

```bash
npm login
```

2. **Update the version in package.json:**

```bash
npm version patch  # or minor/major
```

3. **Build and test the package:**

```bash
npm run build
npm test
```

4. **Publish to npm:**

```bash
npm publish --access public
```

The package is published as `@ktamas77/abletonlink` on npm.

## Requirements

- Node.js >= 18.0.0
- C++ build tools:
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Visual Studio 2019 or later with C++ workload
  - **Linux**: gcc/g++ and make

## Platform Support

- macOS (x64, arm64)
- Windows (x64)
- Linux (x64)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

This package wraps the [Ableton Link SDK](https://github.com/Ableton/link) by Ableton AG.
