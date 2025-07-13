import { AbletonLink, LinkState } from '../index';

// Create a new Link instance
const link = new AbletonLink(120.0);

// Function to get current Link state
function getLinkState(): LinkState {
    return {
        tempo: link.getTempo(),
        beat: link.getBeat(),
        phase: link.getPhase(4.0),
        peers: link.getNumPeers(),
        playing: link.isPlaying()
    };
}

// Function to quantize a beat to the nearest bar
function quantizeBeat(beat: number, quantum: number): number {
    return Math.floor(beat / quantum) * quantum;
}

// Main function
async function main() {
    // Enable Link
    link.enable(true);
    console.log('Ableton Link enabled with TypeScript!');

    // Display initial state
    const initialState = getLinkState();
    console.log('Initial state:', initialState);

    // Example: Metronome with phase-aligned clicks
    let lastPhase = 0;
    const metronomeInterval = setInterval(() => {
        const phase = link.getPhase(1.0); // 1-beat quantum for quarter notes
        
        // Detect when we cross a beat boundary
        if (phase < lastPhase) {
            const beat = Math.floor(link.getBeat());
            const isDownbeat = beat % 4 === 0;
            console.log(isDownbeat ? 'TICK!' : 'tick');
        }
        
        lastPhase = phase;
    }, 10); // Check every 10ms

    // Example: Sync pattern playback
    setTimeout(() => {
        console.log('\nStarting synchronized pattern...');
        link.setIsPlaying(true);
        
        // Force beat alignment for pattern start
        const quantum = 4.0;
        const currentBeat = link.getBeat();
        const nextBar = quantizeBeat(currentBeat, quantum) + quantum;
        const timeForNextBar = link.getTimeForBeat(nextBar, quantum);
        
        console.log(`Pattern will start at beat ${nextBar} (in ${timeForNextBar - Date.now() / 1000} seconds)`);
    }, 5000);

    // Clean up on exit
    process.on('SIGINT', () => {
        clearInterval(metronomeInterval);
        link.enable(false);
        console.log('\nLink disabled. Goodbye!');
        process.exit(0);
    });
}

// Run the example
main().catch(console.error);