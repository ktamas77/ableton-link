const { AbletonLink } = require('../index');

// Create a new Link instance with 120 BPM
const link = new AbletonLink(120.0);

// Enable Link
link.enable(true);
console.log('Ableton Link enabled');

// Enable start/stop sync to synchronize playing state with other Link peers
link.enableStartStopSync(true);
console.log('Start/stop sync enabled');

// Display initial state
console.log('Initial tempo:', link.getTempo(), 'BPM');
console.log('Connected peers:', link.getNumPeers());
console.log('Start/stop sync:', link.isStartStopSyncEnabled());

// Set up a loop to display Link state
setInterval(() => {
    const tempo = link.getTempo();
    const beat = link.getBeat();
    const phase = link.getPhase(4.0); // 4-beat quantum
    const peers = link.getNumPeers();
    const playing = link.isPlaying();
    
    console.log(`Tempo: ${tempo.toFixed(1)} BPM | Beat: ${beat.toFixed(2)} | Phase: ${phase.toFixed(2)} | Peers: ${peers} | Playing: ${playing}`);
}, 100);

// Example: Change tempo after 5 seconds
setTimeout(() => {
    console.log('\nChanging tempo to 128 BPM...');
    link.setTempo(128.0);
}, 5000);

// Example: Start playback after 10 seconds
setTimeout(() => {
    console.log('\nStarting playback...');
    link.setIsPlaying(true);
}, 10000);

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\nDisabling Link...');
    link.enable(false);
    process.exit(0);
});

console.log('\nLink is running. Open Ableton Live or another Link-enabled app to sync!');
console.log('Press Ctrl+C to exit.\n');