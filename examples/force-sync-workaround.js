#!/usr/bin/env node

/**
 * Workaround for initial sync issue
 *
 * This demonstrates a workaround to force synchronization
 * when joining a session that's already playing.
 */

const { AbletonLink } = require('../');

console.log('=== Force Sync Workaround ===\n');

// Create Link instance
const link = new AbletonLink(120.0);

// Track sync events
let syncCount = 0;
link.setStartStopCallback((isPlaying) => {
  syncCount++;
  console.log(`Sync #${syncCount}: ${isPlaying ? 'PLAYING' : 'STOPPED'}`);
});

console.log('1. Enabling Link...');
link.enable(true);

// Wait for peer discovery
setTimeout(() => {
  console.log(`2. Found ${link.getNumPeers()} peers`);

  // Method 1: Toggle sync to force state update
  console.log('\n3. Method 1: Toggle sync on/off/on');
  link.enableStartStopSync(true);
  setTimeout(() => {
    link.enableStartStopSync(false);
    setTimeout(() => {
      link.enableStartStopSync(true);
      console.log('   Toggle complete');
    }, 50);
  }, 50);

  // Method 2: Force a local state change
  setTimeout(() => {
    console.log('\n4. Method 2: Force local state change');
    const currentState = link.isPlaying();
    console.log(`   Current state: ${currentState}`);

    // Briefly toggle the state to trigger sync
    link.setIsPlaying(!currentState);
    setTimeout(() => {
      link.setIsPlaying(currentState);
      console.log('   State toggle complete');
    }, 10);
  }, 1000);

  // Method 3: Request beat at time (triggers timeline sync)
  setTimeout(() => {
    console.log('\n5. Method 3: Request beat at time');
    const currentBeat = link.getBeat();
    link.requestBeatAtTime(currentBeat, Date.now() / 1000 + 0.1, 4.0);
    console.log('   Beat request sent');
  }, 2000);

  // Check final state
  setTimeout(() => {
    console.log('\n6. Final state check:');
    console.log(`   isPlaying: ${link.isPlaying()}`);
    console.log(`   Peers: ${link.getNumPeers()}`);
    console.log(`   Sync callbacks received: ${syncCount}`);

    if (link.getNumPeers() > 0) {
      console.log('\n💡 Analysis:');
      console.log('   - If Ableton is playing but this shows stopped,');
      console.log('     the initial sync may not have propagated.');
      console.log('   - The toggle workaround may help in some cases.');
      console.log('   - This appears to be a limitation in the Link SDK.');
    }

    link.enable(false);
    process.exit(0);
  }, 4000);
}, 1000);
