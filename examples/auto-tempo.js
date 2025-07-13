const { AbletonLink } = require('../index');

// Create Link with a reasonable default tempo (120 BPM)
// This will be automatically replaced when joining an existing session
const link = new AbletonLink(120.0);

// Set up callback to be notified when tempo changes
link.setTempoCallback((tempo) => {
  console.log(`✨ Tempo updated to: ${tempo.toFixed(1)} BPM`);
});

// Set up callback for peer connections
link.setNumPeersCallback((numPeers) => {
  console.log(`🔗 Peers changed: ${numPeers} connected`);
  if (numPeers > 0) {
    console.log('📡 Syncing with existing session...');
  }
});

// Enable Link - it will automatically sync with any existing sessions
link.enable(true);
console.log('🎵 Ableton Link enabled');
console.log(`Initial tempo: ${link.getTempo()} BPM (will auto-sync if peers exist)`);

// Monitor the session
setInterval(() => {
  const tempo = link.getTempo();
  const peers = link.getNumPeers();
  const beat = Math.floor(link.getBeat());
  
  process.stdout.write(`\rTempo: ${tempo.toFixed(1)} BPM | Beat: ${beat} | Peers: ${peers}  `);
}, 100);

// Handle exit
process.on('SIGINT', () => {
  console.log('\n\nDisabling Link...');
  link.enable(false);
  process.exit(0);
});

console.log('\n💡 This example starts with 120 BPM but automatically adopts');
console.log('   the tempo from any existing Link session on the network.');
console.log('\nPress Ctrl+C to exit.\n');