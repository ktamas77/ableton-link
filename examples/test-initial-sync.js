#!/usr/bin/env node

/**
 * Test initial synchronization behavior
 *
 * This test explores different timing scenarios for enableStartStopSync
 */

const { AbletonLink } = require('../');

console.log('=== Testing Initial Sync Behavior ===\n');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testScenario(name, setupFn) {
  console.log(`\n--- ${name} ---`);
  const link = new AbletonLink(120.0);

  let callbackHistory = [];
  link.setStartStopCallback((isPlaying) => {
    callbackHistory.push({
      time: Date.now(),
      state: isPlaying,
      peers: link.getNumPeers(),
    });
    console.log(`  Callback: ${isPlaying ? 'PLAYING' : 'STOPPED'} (peers: ${link.getNumPeers()})`);
  });

  await setupFn(link);

  // Check final state
  await sleep(1000);
  console.log(`  Final: isPlaying=${link.isPlaying()}, peers=${link.getNumPeers()}`);
  console.log(`  Callbacks received: ${callbackHistory.length}`);

  link.enable(false);
  await sleep(100);
}

async function runTests() {
  console.log('Make sure Ableton Live is PLAYING before running this test!\n');
  await sleep(2000);

  // Test 1: Enable everything at once
  await testScenario('Enable everything immediately', async (link) => {
    link.enable(true);
    link.enableStartStopSync(true);
  });

  // Test 2: Enable with delay
  await testScenario('Enable with 500ms delay', async (link) => {
    link.enable(true);
    await sleep(500);
    link.enableStartStopSync(true);
  });

  // Test 3: Enable with longer delay
  await testScenario('Enable with 1s delay', async (link) => {
    link.enable(true);
    await sleep(1000);
    link.enableStartStopSync(true);
  });

  // Test 4: Check state before and after
  await testScenario('Check state transitions', async (link) => {
    console.log(`  Before enable: ${link.isPlaying()}`);
    link.enable(true);
    console.log(`  After enable: ${link.isPlaying()}`);
    await sleep(500);
    console.log(`  Before sync: ${link.isPlaying()}`);
    link.enableStartStopSync(true);
    console.log(`  After sync: ${link.isPlaying()}`);
    await sleep(100);
    console.log(`  After delay: ${link.isPlaying()}`);
  });

  // Test 5: Toggle sync
  await testScenario('Toggle sync on/off/on', async (link) => {
    link.enable(true);
    await sleep(500);
    link.enableStartStopSync(true);
    await sleep(200);
    link.enableStartStopSync(false);
    await sleep(200);
    link.enableStartStopSync(true);
  });

  console.log('\n=== Tests Complete ===\n');
}

runTests().catch(console.error);
