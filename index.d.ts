/**
 * Ableton Link - Real-time music synchronization
 */
export declare class AbletonLink {
    /**
     * Creates a new Ableton Link instance
     * @param bpm Initial tempo in beats per minute
     */
    constructor(bpm: number);

    /**
     * Enable or disable Link synchronization
     * @param enabled Whether to enable Link
     */
    enable(enabled: boolean): void;

    /**
     * Check if Link is currently enabled
     * @returns Whether Link is enabled
     */
    isEnabled(): boolean;

    /**
     * Get the current tempo
     * @returns Current tempo in beats per minute
     */
    getTempo(): number;

    /**
     * Set a new tempo
     * @param bpm New tempo in beats per minute
     */
    setTempo(bpm: number): void;

    /**
     * Get the current beat position
     * @returns Current beat position
     */
    getBeat(): number;

    /**
     * Get the current phase for a given quantum
     * @param quantum The quantum (beat subdivision) to use
     * @returns Current phase within the quantum (0.0 to quantum)
     */
    getPhase(quantum: number): number;

    /**
     * Get the number of connected Link peers
     * @returns Number of connected peers
     */
    getNumPeers(): number;

    /**
     * Set the playing state
     * @param playing Whether transport should be playing
     */
    setIsPlaying(playing: boolean): void;

    /**
     * Check if transport is currently playing
     * @returns Whether transport is playing
     */
    isPlaying(): boolean;

    /**
     * Force a specific beat at a specific time
     * @param beat The beat position to force
     * @param time The time in seconds
     * @param quantum The quantum to use for alignment
     */
    forceBeatAtTime(beat: number, time: number, quantum: number): void;

    /**
     * Get the time for a specific beat
     * @param beat The beat position
     * @param quantum The quantum to use
     * @returns Time in seconds
     */
    getTimeForBeat(beat: number, quantum: number): number;
}

/**
 * Link state information
 */
export interface LinkState {
    /** Current tempo in BPM */
    tempo: number;
    /** Current beat position */
    beat: number;
    /** Current phase for 4-beat quantum */
    phase: number;
    /** Number of connected peers */
    peers: number;
    /** Whether transport is playing */
    playing: boolean;
}

/**
 * Callback for peer count changes
 */
export type PeerCountCallback = (numPeers: number) => void;

/**
 * Callback for tempo changes
 */
export type TempoCallback = (tempo: number) => void;