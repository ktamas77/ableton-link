#!/usr/bin/env node

/**
 * Diagnose isPlaying functionality
 *
 * This example helps diagnose why isPlaying might not be working correctly.
 */

const { AbletonLink } = require('../');

console.log('=== Ableton Link isPlaying Diagnostics ===\n');

// Test 1: Create Link instance
console.log('1. Creating Link instance...');
let link;
try {
  link = new AbletonLink(120.0);
  console.log('   ✅ Link instance created successfully');
} catch (e) {
  console.log('   ❌ Failed to create Link instance:', e.message);
  process.exit(1);
}

// Test 2: Check initial state
console.log('\n2. Initial state:');
console.log(`   - isEnabled: ${link.isEnabled()}`);
console.log(`   - isStartStopSyncEnabled: ${link.isStartStopSyncEnabled()}`);
console.log(`   - isPlaying: ${link.isPlaying()}`);

// Test 3: Enable Link
console.log('\n3. Enabling Link...');
link.enable(true);
console.log(`   - isEnabled: ${link.isEnabled()}`);

// Test 4: Enable start/stop sync
console.log('\n4. Enabling start/stop sync...');
link.enableStartStopSync(true);
console.log(`   - isStartStopSyncEnabled: ${link.isStartStopSyncEnabled()}`);

// Test 5: Check peers
console.log('\n5. Checking network connectivity:');
console.log(`   - Number of peers: ${link.getNumPeers()}`);
if (link.getNumPeers() === 0) {
  console.log('   ⚠️  No peers found. Make sure:');
  console.log('      - Ableton Live is running with Link enabled');
  console.log('      - Both applications are on the same network');
  console.log('      - Firewall is not blocking Link (port 20808)');
}

// Test 6: Test callback
console.log('\n6. Setting up start/stop callback...');
let callbackFired = false;
link.setStartStopCallback((isPlaying) => {
  callbackFired = true;
  console.log(`   🔔 Callback fired: isPlaying = ${isPlaying}`);
});

// Test 7: Test setIsPlaying
console.log('\n7. Testing setIsPlaying locally...');
console.log('   - Current state:', link.isPlaying());
console.log('   - Setting to true...');
link.setIsPlaying(true);
console.log('   - New state:', link.isPlaying());
console.log('   - Setting to false...');
link.setIsPlaying(false);
console.log('   - Final state:', link.isPlaying());

// Test 8: Monitor for changes
console.log('\n8. Monitoring for 10 seconds...');
console.log('   Press Play/Stop in Ableton Live to test synchronization\n');

let lastState = link.isPlaying();
let changeDetected = false;

const checkInterval = setInterval(() => {
  const currentState = link.isPlaying();
  const numPeers = link.getNumPeers();

  if (currentState !== lastState) {
    changeDetected = true;
    console.log(
      `   ✅ State change detected: ${lastState} -> ${currentState} (Peers: ${numPeers})`
    );
    lastState = currentState;
  }

  process.stdout.write(
    `\r   Current: ${currentState ? 'PLAYING' : 'STOPPED'} | Peers: ${numPeers} | Callback fired: ${callbackFired ? 'Yes' : 'No'} `
  );
}, 100);

setTimeout(() => {
  clearInterval(checkInterval);
  console.log('\n\n=== Diagnostics Complete ===\n');

  console.log('Summary:');
  console.log(`- Link enabled: ${link.isEnabled() ? '✅' : '❌'}`);
  console.log(`- Start/stop sync enabled: ${link.isStartStopSyncEnabled() ? '✅' : '❌'}`);
  console.log(`- Peers found: ${link.getNumPeers() > 0 ? '✅' : '❌'} (${link.getNumPeers()})`);
  console.log(`- Callback fired: ${callbackFired ? '✅' : '❌'}`);
  console.log(`- State changes detected: ${changeDetected ? '✅' : '❌'}`);

  if (!changeDetected && link.getNumPeers() === 0) {
    console.log('\n⚠️  No state changes detected and no peers found.');
    console.log('This suggests a network connectivity issue.');
  } else if (!changeDetected && link.getNumPeers() > 0) {
    console.log('\n⚠️  Peers found but no state changes detected.');
    console.log('Try pressing Play/Stop in Ableton Live.');
  }

  link.enable(false);
  process.exit(0);
}, 10000);
