#!/usr/bin/env node

/**
 * Sync with already-playing session
 *
 * This example shows how to properly sync with a Link session
 * that's already playing when you join.
 */

const { AbletonLink } = require('../');

console.log('=== Sync with Playing Session ===\n');

// Create and configure Link
const link = new AbletonLink(120.0);

// Strategy: Set up the callback first, then enable everything
let syncComplete = false;
let initialState = null;

link.setStartStopCallback((isPlaying) => {
  console.log(`\nCallback: Transport is now ${isPlaying ? 'PLAYING' : 'STOPPED'}`);
  if (initialState === null) {
    initialState = isPlaying;
    syncComplete = true;
  }
});

console.log('1. Enabling Link...');
link.enable(true);

console.log('2. Enabling start/stop sync...');
link.enableStartStopSync(true);

console.log('3. Waiting for initial sync...\n');

// Wait for initial sync or timeout
const waitForSync = (callback) => {
  const startTime = Date.now();
  const checkInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;

    if (syncComplete || elapsed > 2000) {
      clearInterval(checkInterval);
      callback();
    } else {
      process.stdout.write(`\rWaiting for sync... ${(elapsed / 1000).toFixed(1)}s`);
    }
  }, 100);
};

waitForSync(() => {
  console.log('\n\n4. Initial sync complete!');
  console.log(`   - Current state: ${link.isPlaying() ? 'PLAYING' : 'STOPPED'}`);
  console.log(`   - Peers: ${link.getNumPeers()}`);

  if (initialState !== null) {
    console.log(`   - Initial callback reported: ${initialState ? 'PLAYING' : 'STOPPED'}`);
  }

  // Now we're properly synced, monitor normally
  console.log('\n5. Monitoring synchronized state...\n');

  let lastState = link.isPlaying();
  const monitor = setInterval(() => {
    const playing = link.isPlaying();
    const tempo = link.getTempo();
    const beat = link.getBeat();
    const peers = link.getNumPeers();

    if (playing !== lastState) {
      console.log(
        `\n🔄 State changed: ${lastState ? 'PLAYING' : 'STOPPED'} → ${playing ? 'PLAYING' : 'STOPPED'}`
      );
      lastState = playing;
    }

    const status = playing ? '▶️  PLAYING' : '⏸️  STOPPED';
    process.stdout.write(
      `\r${status} | ${tempo.toFixed(1)} BPM | Beat ${beat.toFixed(2)} | Peers: ${peers}  `
    );
  }, 100);

  console.log('Press Ctrl+C to exit\n');

  process.on('SIGINT', () => {
    clearInterval(monitor);
    console.log('\n\nShutting down...');
    link.enable(false);
    process.exit(0);
  });
});

// Also add a manual sync check function
setTimeout(() => {
  console.log('\n\n💡 Tip: You can also manually request the current session state');
  console.log('by toggling start/stop sync off and on again:');
  console.log('  link.enableStartStopSync(false);');
  console.log('  link.enableStartStopSync(true);');
}, 10000);
