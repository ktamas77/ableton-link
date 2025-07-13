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

### `setIsPlaying(playing: boolean): void`
Start or stop transport playback.

### `enableStartStopSync(enabled: boolean): void`
Enable or disable start/stop synchronization with other Link peers. When enabled, play/stop state changes will be synchronized across all connected applications.

### `isStartStopSyncEnabled(): boolean`
Check if start/stop synchronization is enabled.

### `forceBeatAtTime(beat: number, time: number, quantum: number): void`
Force a specific beat at a specific time with the given quantum.

## Implementation Plan

### Components
- **Ableton Link SDK (C++)** – Official synchronization engine from Ableton
- **Node.js Native Addon** – C++ bridge to expose Link functionality to JS/TS
- **node-gyp** – Build system for compiling the native module
- **TypeScript Definitions** – Clean and typed API exposed to the user

### Project Structure
```
ableton-link/
├── src/                      # C++ source files
│   ├── abletonlink.cc       # Main addon implementation
│   └── abletonlink.h        # Header file
├── lib/                      # Compiled output
├── link/                     # Ableton Link SDK (git submodule)
├── binding.gyp              # node-gyp build configuration
├── index.js                 # Main entry point
├── index.d.ts               # TypeScript definitions
├── package.json             # NPM package configuration
├── tsconfig.json            # TypeScript configuration
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