#!/usr/bin/env node

/**
 * Monitor isPlaying state
 *
 * This example demonstrates how to monitor the play/stop state
 * synchronized with Ableton Live or other Link-enabled applications.
 *
 * IMPORTANT: Start/stop sync must be enabled for isPlaying to work!
 */

const { AbletonLink } = require('../');

// Create Link instance with 120 BPM
const link = new AbletonLink(120.0);

// Enable Link
link.enable(true);

// IMPORTANT: Enable start/stop sync - this is required for isPlaying to work
link.enableStartStopSync(true);

console.log('=== Ableton Link isPlaying Monitor ===\n');
console.log('Configuration:');
console.log(`  Link enabled: ${link.isEnabled()}`);
console.log(`  Start/stop sync: ${link.isStartStopSyncEnabled()}`);
console.log(`  Initial tempo: ${link.getTempo()} BPM`);
console.log('');

// Set up start/stop callback to get notified of state changes
let lastCallbackState = null;
link.setStartStopCallback((isPlaying) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`\n[${timestamp}] Start/Stop Callback Triggered:`);
  console.log(`  State changed to: ${isPlaying ? '▶️  PLAYING' : '⏸️  STOPPED'}`);
  lastCallbackState = isPlaying;
});

// Monitor state periodically
let previousState = null;
let stateChangeCount = 0;

const monitor = setInterval(() => {
  const playing = link.isPlaying();
  const tempo = link.getTempo();
  const beat = link.getBeat();
  const phase = link.getPhase(4.0); // 4-beat quantum
  const numPeers = link.getNumPeers();

  // Check if state changed
  if (previousState !== null && previousState !== playing) {
    stateChangeCount++;
    console.log(`\n🔄 State Change Detected! (Change #${stateChangeCount})`);
  }
  previousState = playing;

  // Create status line
  const status = playing ? '▶️  PLAYING' : '⏸️  STOPPED';
  const beatStr = beat.toFixed(2).padStart(7);
  const phaseStr = phase.toFixed(2).padStart(5);
  const tempoStr = tempo.toFixed(1).padStart(6);

  // Show if there's a mismatch between callback and polling
  const mismatch =
    lastCallbackState !== null && lastCallbackState !== playing ? ' ⚠️ MISMATCH' : '';

  process.stdout.write(
    `\r${status} | Tempo: ${tempoStr} BPM | Beat: ${beatStr} | Phase: ${phaseStr} | Peers: ${numPeers}${mismatch}  `
  );
}, 100);

console.log('\nMonitoring Link state... (updates every 100ms)\n');
console.log('Instructions:');
console.log('  1. Open Ableton Live and enable Link');
console.log('  2. Make sure both apps are on the same network');
console.log('  3. Press Play/Stop in Ableton to see state changes');
console.log('  4. The callback should trigger when state changes');
console.log('  5. Press Ctrl+C to exit\n');
console.log('Status:');

// Handle graceful shutdown
process.on('SIGINT', () => {
  clearInterval(monitor);
  console.log('\n\nShutting down...');
  link.enable(false);
  process.exit(0);
});

// Also test the setIsPlaying method after 5 seconds
setTimeout(() => {
  console.log('\n\n📝 Testing setIsPlaying(true) from Node.js side...');
  link.setIsPlaying(true);

  setTimeout(() => {
    console.log('\n📝 Testing setIsPlaying(false) from Node.js side...');
    link.setIsPlaying(false);
  }, 3000);
}, 5000);
