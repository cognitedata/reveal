import { jest } from '@jest/globals';

export function setupAudioMock(shouldSucceed = true) {
    if (!global.window) {
        global.window = {} as unknown as Window & typeof globalThis;
    }

    if (!shouldSucceed) {
        delete (global.window as any).OfflineAudioContext;
        return;
    }

    const mockAudioParam = { setValueAtTime: jest.fn() };
    const mockAudioBuffer = {
        getChannelData: jest.fn().mockReturnValue(new Float32Array(10000).fill(0.5)),
    };

    const mockOfflineAudioContext = function() {
        const mockCompressor = {
            connect: jest.fn(),
            threshold: mockAudioParam, knee: mockAudioParam, ratio: mockAudioParam,
            reduction: mockAudioParam, attack: mockAudioParam, release: mockAudioParam
        };
        const mockOscillator = {
            type: '', frequency: mockAudioParam,
            connect: jest.fn(), start: jest.fn()
        };

        return {
            currentTime: 0,
            destination: {},
            createOscillator: jest.fn().mockReturnValue(mockOscillator),
            createDynamicsCompressor: jest.fn().mockReturnValue(mockCompressor),
            
            startRendering: jest.fn(function(this: any) {
              // Mimic async functionality
                setTimeout(() => {
                    if (this.oncomplete) {
                        this.oncomplete({ renderedBuffer: mockAudioBuffer });
                    }
                }, 0);
            }),
            oncomplete: null as any,
        };
    } as unknown as typeof OfflineAudioContext;

    (global.window as any).OfflineAudioContext = mockOfflineAudioContext;
}