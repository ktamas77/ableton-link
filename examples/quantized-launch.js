const { AbletonLink } = require('../index');

// Create a new Link instance with 120 BPM
const link = new AbletonLink(120.0);

// Enable Link and start/stop sync
link.enable(true);
link.enableStartStopSync(true);
console.log('Ableton Link enabled with quantized launch support');

// Display initial state
console.log('Initial tempo:', link.getTempo(), 'BPM');
console.log('Connected peers:', link.getNumPeers());
console.log('Playing:', link.isPlaying());

// Helper to get Link time (microseconds since app start)
function getLinkTime() {
  // Get current beat and calculate approximate Link time
  const beat = link.getBeat();
  const tempo = link.getTempo();
  const beatsPerSecond = tempo / 60.0;
  return beat / beatsPerSecond;
}

// Example 1: Quantized beat alignment
// When working with other peers, requestBeatAtTime will quantize to the nearest quantum
console.log('\n=== Example 1: Quantized Beat Alignment ===');
setTimeout(() => {
  const currentLinkTime = getLinkTime();
  const futureTime = currentLinkTime + 2.0; // 2 seconds from now

  console.log('Requesting beat 0 to align in 2 seconds');
  console.log('With 4-beat quantum for proper bar alignment');

  link.requestBeatAtTime(0, futureTime, 4.0);
}, 1000);

// Example 2: Start playback with beat alignment
console.log('\n=== Example 2: Start Playback with Beat Reset ===');
setTimeout(() => {
  console.log('Requesting beat 0 when playback starts (resets the beat counter)');
  link.requestBeatAtStartPlayingTime(0, 4.0);

  // Actually start playback
  setTimeout(() => {
    console.log('Starting playback now...');
    link.setIsPlaying(true);
  }, 500);
}, 5000);

// Example 3: Combined operation - start playing at specific time with beat reset
console.log('\n=== Example 3: Synchronized Start with Beat Reset ===');
setTimeout(() => {
  const currentLinkTime = getLinkTime();
  const startTime = currentLinkTime + 2.0; // Start in 2 seconds

  console.log('Scheduling playback to start in 2 seconds with beat reset to 0');
  link.setIsPlayingAndRequestBeatAtTime(true, startTime, 0, 4.0);

  // Check when it will actually start
  setTimeout(() => {
    const actualStartTime = link.timeForIsPlaying();
    if (actualStartTime > 0) {
      console.log('Transport scheduled to start/stop');
    }
  }, 100);
}, 10000);

// Monitor the beat progression
let lastBeat = -1;
setInterval(() => {
  const beat = link.getBeat();
  const phase = link.getPhase(4.0);
  const playing = link.isPlaying();

  // Show beat changes
  if (Math.floor(beat) !== lastBeat) {
    lastBeat = Math.floor(beat);
    // Fix for negative beats - use proper modulo
    const barBeat = (((lastBeat % 4) + 4) % 4) + 1;
    const bar = Math.floor(lastBeat / 4) + 1;

    // Only show positive beats for clarity
    if (lastBeat >= 0) {
      console.log(`Bar ${bar}, Beat ${barBeat} | Phase: ${phase.toFixed(2)} | Playing: ${playing}`);
    }
  }
}, 100);

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\nDisabling Link...');
  link.enable(false);
  process.exit(0);
});

// Auto-exit after demo completes
setTimeout(() => {
  console.log('\nDemo complete. Exiting...');
  link.enable(false);
  process.exit(0);
}, 15000);

console.log('\n📍 Quantized launch features help synchronize starts/stops');
console.log('📍 When peers are connected, beats align to the shared quantum');
console.log('📍 This ensures all apps start on the same bar/beat');
console.log('\nDemo will run for 15 seconds. Press Ctrl+C to exit early.\n');
