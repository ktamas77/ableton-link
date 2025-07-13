#!/usr/bin/env node

/**
 * Diagnose isPlaying sync behavior
 *
 * This example specifically tests the synchronization behavior when
 * connecting to a session that's already playing.
 */

const { AbletonLink } = require('../');

console.log('=== Ableton Link Playing State Sync Test ===\n');

// Create Link instance
const link = new AbletonLink(120.0);

// Track all state changes
const stateHistory = [];
let callbackCount = 0;

// Set up callback BEFORE enabling anything
link.setStartStopCallback((isPlaying) => {
  callbackCount++;
  const timestamp = Date.now();
  const event = {
    time: timestamp,
    callback: true,
    state: isPlaying,
    peers: link.getNumPeers(),
    callbackNum: callbackCount,
  };
  stateHistory.push(event);
  console.log(`\n🔔 Callback #${callbackCount}: isPlaying = ${isPlaying} (peers: ${event.peers})`);
});

console.log('1. Initial state (before enabling):');
console.log(`   - isPlaying: ${link.isPlaying()}`);
console.log(`   - isEnabled: ${link.isEnabled()}`);
console.log(`   - isStartStopSyncEnabled: ${link.isStartStopSyncEnabled()}`);

// Enable Link
console.log('\n2. Enabling Link...');
link.enable(true);
console.log(`   - isEnabled: ${link.isEnabled()}`);
console.log(`   - isPlaying: ${link.isPlaying()}`);

// Wait a moment for network discovery
console.log('\n3. Waiting for network discovery...');
setTimeout(() => {
  console.log(`   - Peers found: ${link.getNumPeers()}`);
  console.log(`   - isPlaying (before sync): ${link.isPlaying()}`);

  // Now enable start/stop sync
  console.log('\n4. Enabling start/stop sync...');
  const beforeSync = link.isPlaying();
  link.enableStartStopSync(true);
  const afterSync = link.isPlaying();

  console.log(`   - isPlaying before enableStartStopSync: ${beforeSync}`);
  console.log(`   - isPlaying after enableStartStopSync: ${afterSync}`);
  console.log(`   - Callbacks fired so far: ${callbackCount}`);

  // Check state after a short delay
  setTimeout(() => {
    console.log('\n5. State after sync delay (100ms):');
    console.log(`   - isPlaying: ${link.isPlaying()}`);
    console.log(`   - Peers: ${link.getNumPeers()}`);
    console.log(`   - Total callbacks: ${callbackCount}`);

    // Monitor for a few seconds
    console.log('\n6. Monitoring state changes for 5 seconds...\n');

    let lastState = link.isPlaying();
    const startTime = Date.now();

    const monitor = setInterval(() => {
      const currentState = link.isPlaying();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      if (currentState !== lastState) {
        console.log(`\n   [${elapsed}s] State changed: ${lastState} → ${currentState}`);
        lastState = currentState;
      }

      process.stdout.write(
        `\r   [${elapsed}s] Current: ${currentState ? 'PLAYING' : 'STOPPED'} | Peers: ${link.getNumPeers()} | Callbacks: ${callbackCount}`
      );
    }, 100);

    setTimeout(() => {
      clearInterval(monitor);

      console.log('\n\n=== Analysis ===\n');

      // Analyze callback sequence
      if (stateHistory.length > 0) {
        console.log('Callback sequence:');
        stateHistory.forEach((event, index) => {
          const relTime = index > 0 ? `+${event.time - stateHistory[0].time}ms` : '0ms';
          console.log(
            `  ${index + 1}. ${event.state ? 'PLAYING' : 'STOPPED'} at ${relTime} (peers: ${event.peers})`
          );
        });

        // Check for specific patterns
        if (
          stateHistory.length >= 2 &&
          stateHistory[0].state === true &&
          stateHistory[1].state === false
        ) {
          console.log('\n⚠️  Detected rapid PLAYING→STOPPED sequence.');
          console.log('This suggests the initial sync briefly adopted the playing state');
          console.log('before settling to the local stopped state.');
        }
      }

      console.log('\nFinal state:');
      console.log(`  - isPlaying: ${link.isPlaying()}`);
      console.log(`  - Peers: ${link.getNumPeers()}`);

      if (link.getNumPeers() > 0 && !link.isPlaying()) {
        console.log('\n💡 Tip: If Ableton is playing but this shows STOPPED,');
        console.log('the initial sync may have failed. Try:');
        console.log('  1. Stop playback in Ableton');
        console.log('  2. Run this script');
        console.log('  3. Start playback in Ableton');
        console.log('This ensures clean state synchronization.');
      }

      link.enable(false);
      process.exit(0);
    }, 5000);
  }, 100);
}, 1000);
