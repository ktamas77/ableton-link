const { AbletonLink } = require('../index');

// Create a new Link instance with 120 BPM
const link = new AbletonLink(120.0);

// Set up callbacks before enabling Link
console.log('Setting up callbacks...');

// Callback for when peer count changes
link.setNumPeersCallback((numPeers) => {
    console.log(`🔗 Peer count changed: ${numPeers} connected`);
});

// Callback for when tempo changes
link.setTempoCallback((tempo) => {
    console.log(`🎵 Tempo changed: ${tempo.toFixed(1)} BPM`);
});

// Callback for when play/stop state changes
link.setStartStopCallback((isPlaying) => {
    console.log(`${isPlaying ? '▶️  Started' : '⏸️  Stopped'} playback`);
});

// Enable Link and start/stop sync
link.enable(true);
link.enableStartStopSync(true);
console.log('Ableton Link enabled with callbacks');

// Display initial state
console.log('\nInitial state:');
console.log(`Tempo: ${link.getTempo()} BPM`);
console.log(`Peers: ${link.getNumPeers()}`);
console.log(`Playing: ${link.isPlaying()}`);

// Set up a simple status display
let lastBeat = 0;
setInterval(() => {
    const beat = link.getBeat();
    const phase = link.getPhase(4.0);
    
    // Only show beat progression, not every update
    if (Math.floor(beat) !== Math.floor(lastBeat)) {
        console.log(`Beat ${Math.floor(beat)} | Phase: ${phase.toFixed(2)}`);
        lastBeat = beat;
    }
}, 100);

// Example: Change tempo after 5 seconds to trigger callback
setTimeout(() => {
    console.log('\n📝 Manually changing tempo to 128 BPM...');
    link.setTempo(128.0);
}, 5000);

// Example: Toggle playback after 10 seconds
setTimeout(() => {
    console.log('\n📝 Manually toggling playback...');
    link.setIsPlaying(!link.isPlaying());
}, 10000);

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\nDisabling Link...');
    link.enable(false);
    process.exit(0);
});

console.log('\n✨ Callbacks are active! Try:');
console.log('- Opening Ableton Live or another Link app (peer callback)');
console.log('- Changing tempo in any connected app (tempo callback)');
console.log('- Starting/stopping playback in any connected app (start/stop callback)');
console.log('Press Ctrl+C to exit.\n');