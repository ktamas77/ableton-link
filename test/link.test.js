const { AbletonLink } = require('../index');

describe('AbletonLink', () => {
    let link;

    beforeEach(() => {
        link = new AbletonLink(120.0);
    });

    afterEach(() => {
        if (link && link.isEnabled()) {
            link.enable(false);
        }
    });

    test('should create Link instance with initial tempo', () => {
        expect(link).toBeDefined();
        expect(link.getTempo()).toBe(120.0);
    });

    test('should enable and disable Link', () => {
        expect(link.isEnabled()).toBe(false);
        
        link.enable(true);
        expect(link.isEnabled()).toBe(true);
        
        link.enable(false);
        expect(link.isEnabled()).toBe(false);
    });

    test('should set and get tempo', () => {
        link.setTempo(128.0);
        expect(link.getTempo()).toBe(128.0);
        
        link.setTempo(90.5);
        expect(link.getTempo()).toBe(90.5);
    });

    test('should get beat position', () => {
        const beat = link.getBeat();
        expect(typeof beat).toBe('number');
        expect(beat).toBeGreaterThanOrEqual(0);
    });

    test('should get phase for quantum', () => {
        const phase = link.getPhase(4.0);
        expect(typeof phase).toBe('number');
        expect(phase).toBeGreaterThanOrEqual(0);
        expect(phase).toBeLessThan(4.0);
    });

    test('should get number of peers', () => {
        const peers = link.getNumPeers();
        expect(typeof peers).toBe('number');
        expect(peers).toBeGreaterThanOrEqual(0);
    });

    test('should set and get playing state', () => {
        expect(link.isPlaying()).toBe(false);
        
        link.setIsPlaying(true);
        expect(link.isPlaying()).toBe(true);
        
        link.setIsPlaying(false);
        expect(link.isPlaying()).toBe(false);
    });

    test('should get time for beat', () => {
        const time = link.getTimeForBeat(4.0, 4.0);
        expect(typeof time).toBe('number');
        expect(time).toBeGreaterThan(0);
    });

    test('should force beat at time', () => {
        // This should not throw
        expect(() => {
            link.forceBeatAtTime(0.0, Date.now() / 1000, 4.0);
        }).not.toThrow();
    });

    test('should handle invalid constructor arguments', () => {
        expect(() => new AbletonLink()).toThrow();
        expect(() => new AbletonLink('invalid')).toThrow();
    });

    test('should handle invalid method arguments', () => {
        expect(() => link.enable()).toThrow();
        expect(() => link.enable('invalid')).toThrow();
        expect(() => link.setTempo()).toThrow();
        expect(() => link.setTempo('invalid')).toThrow();
        expect(() => link.getPhase()).toThrow();
        expect(() => link.getPhase('invalid')).toThrow();
    });
});