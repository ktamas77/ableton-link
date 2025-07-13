#!/usr/bin/env node

/**
 * Best practices for joining a Link session that may already be playing
 *
 * This example demonstrates the recommended approach for synchronizing
 * with an existing Link session, handling the case where playback
 * is already active.
 */

const { AbletonLink } = require('../');

console.log('=== Best Practices: Joining a Playing Session ===\n');

// Configuration
const INITIAL_TEMPO = 120.0;
const SYNC_TIMEOUT_MS = 3000;

// Create Link instance
const link = new AbletonLink(INITIAL_TEMPO);

// Track synchronization state
let isInitialized = false;
let lastKnownState = null;
let syncStartTime = Date.now();

console.log('Setting up Link with proper initialization sequence...\n');

// Step 1: Set up all callbacks BEFORE enabling anything
console.log('1. Setting up callbacks...');

link.setStartStopCallback((isPlaying) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(
    `\n[${timestamp}] Transport state changed: ${isPlaying ? '▶️  PLAYING' : '⏸️  STOPPED'}`
  );

  // Mark as initialized after first callback
  if (!isInitialized) {
    isInitialized = true;
    console.log('   ✅ Initial sync received from session');
  }

  lastKnownState = isPlaying;
});

link.setNumPeersCallback((numPeers) => {
  console.log(`\n🔗 Peers changed: ${numPeers} ${numPeers === 1 ? 'peer' : 'peers'} connected`);
});

link.setTempoCallback((tempo) => {
  console.log(`\n🎵 Tempo changed: ${tempo.toFixed(1)} BPM`);
});

// Step 2: Enable Link first (for network discovery)
console.log('\n2. Enabling Link for network discovery...');
link.enable(true);

// Step 3: Wait a moment for peer discovery
setTimeout(() => {
  const peers = link.getNumPeers();
  console.log(`\n3. Network status: ${peers} ${peers === 1 ? 'peer' : 'peers'} found`);

  if (peers === 0) {
    console.log('   ⚠️  No peers found. Make sure Ableton Live has Link enabled.');
  }

  // Step 4: Enable start/stop sync
  console.log('\n4. Enabling start/stop sync...');
  link.enableStartStopSync(true);

  // Step 5: Wait for initial sync or timeout
  console.log('\n5. Waiting for initial synchronization...');

  const checkSync = setInterval(() => {
    const elapsed = Date.now() - syncStartTime;

    // Check if we've received initial state or timed out
    if (isInitialized || elapsed > SYNC_TIMEOUT_MS) {
      clearInterval(checkSync);

      if (!isInitialized) {
        console.log('\n   ⚠️  No initial sync received. Using local state.');
        lastKnownState = link.isPlaying();
      }

      startMonitoring();
    } else {
      process.stdout.write(
        `\r   Waiting... ${(elapsed / 1000).toFixed(1)}s / ${(SYNC_TIMEOUT_MS / 1000).toFixed(1)}s`
      );
    }
  }, 100);
}, 500);

// Main monitoring function
function startMonitoring() {
  console.log('\n\n6. ✅ Initialization complete! Now monitoring...\n');

  // Show current status
  console.log('Current status:');
  console.log(`  - Transport: ${link.isPlaying() ? 'PLAYING' : 'STOPPED'}`);
  console.log(`  - Tempo: ${link.getTempo().toFixed(1)} BPM`);
  console.log(`  - Peers: ${link.getNumPeers()}`);
  console.log(`  - Beat: ${link.getBeat().toFixed(2)}`);

  console.log('\nMonitoring Link session (press Ctrl+C to exit)...\n');

  // Continuous monitoring
  let displayState = link.isPlaying();
  setInterval(() => {
    const playing = link.isPlaying();
    const tempo = link.getTempo();
    const beat = link.getBeat();
    const phase = link.getPhase(4.0);
    const peers = link.getNumPeers();

    // Update display if state changed (without callback)
    if (playing !== displayState) {
      displayState = playing;
      console.log(`\n⚠️  State mismatch detected (callback may be pending)`);
    }

    const status = playing ? '▶️ ' : '⏸️ ';
    const beatStr = beat.toFixed(2).padStart(7);
    const phaseStr = `${Math.floor(phase) + 1}/4`;

    process.stdout.write(
      `\r${status} ${tempo.toFixed(1)} BPM | Beat ${beatStr} | Bar ${phaseStr} | Peers: ${peers}  `
    );
  }, 100);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down Link...');
  link.enableStartStopSync(false);
  link.enable(false);
  console.log('Goodbye! 👋\n');
  process.exit(0);
});

// Additional tips
setTimeout(() => {
  if (!link.isPlaying() && link.getNumPeers() > 0) {
    console.log('\n\n💡 Tip: If Ableton is playing but this shows stopped:');
    console.log('   1. Try stopping and starting playback in Ableton');
    console.log('   2. Or restart this script while Ableton is stopped');
    console.log('   This ensures clean synchronization between apps.\n');
  }
}, 8000);
