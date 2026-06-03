/*!
 * Copyright 2025 Cognite AS
 */
import { vi } from 'vitest';

import type {
  GetContextReturnType,
  PartialDocument,
  PartialOfflineAudioContext,
  PartialOfflineAudioContextInstance,
  RequiredOfflineAudioContext
} from '../../packages/metrics/src/Fingerprint/types';

export function createMockOfflineAudioContext(shouldSucceed: boolean): PartialOfflineAudioContext {
  class OfflineAudioContextMock implements PartialOfflineAudioContextInstance {
    public currentTime: number;
    public createOscillator: () => OscillatorNode;
    public createDynamicsCompressor: () => DynamicsCompressorNode;
    public destination: RequiredOfflineAudioContext['destination'];
    public startRendering: () => Promise<AudioBuffer>;

    constructor(_numberOfChannels: number, _length: number, _sampleRate: number) {
      this.currentTime = 0;
      this.createOscillator = vi.fn<() => OscillatorNode>(createMockOscillatorNode);
      this.createDynamicsCompressor = vi.fn<() => DynamicsCompressorNode>(createMockDynamicCompressorNode);
      this.destination = createMockAudioDestinationNode();
      this.startRendering = vi.fn(() => {
        if (shouldSucceed) {
          const mockData = Array.from({ length: 5000 }, (_, i) => (i > 4499 && i < 5000 ? 0.001 : 0));
          return Promise.resolve(createMockAudioBuffer(mockData));
        }
        return Promise.reject(new Error('Rendering failed.'));
      });
    }
  }
  return OfflineAudioContextMock;
}

function createMockAudioDestinationNode(): AudioDestinationNode {
  return {
    channelCount: 2,
    channelCountMode: 'explicit',
    channelInterpretation: 'speakers',
    maxChannelCount: 2,
    numberOfInputs: 1,
    numberOfOutputs: 1,
    context: {} as AudioContext,
    connect: vi.fn() as AudioDestinationNode['connect'],
    disconnect: vi.fn() as AudioDestinationNode['disconnect'],
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn() as AudioDestinationNode['dispatchEvent']
  };
}

export function createMockDocument(): PartialDocument {
  const mockContext: GetContextReturnType = {
    textBaseline: 'middle',
    font: '',
    fillStyle: '',
    fillRect: vi.fn(),
    fillText: vi.fn()
  };

  const mockCanvas: ReturnType<PartialDocument['createElement']> = {
    getContext: vi.fn((_: '2d') => mockContext),
    toDataURL: vi.fn(() => 'data:image/png;base64,mock-data')
  };

  return {
    createElement: vi.fn((_: 'canvas') => mockCanvas)
  };
}

function createMockAudioParam(): AudioParam {
  return {
    automationRate: 'a-rate',
    defaultValue: 0,
    maxValue: 1,
    minValue: 0,
    value: 0,

    setValueAtTime: vi.fn<AudioParam['setValueAtTime']>(),
    linearRampToValueAtTime: vi.fn<AudioParam['linearRampToValueAtTime']>(),
    exponentialRampToValueAtTime: vi.fn<AudioParam['exponentialRampToValueAtTime']>(),
    setTargetAtTime: vi.fn<AudioParam['setTargetAtTime']>(),
    setValueCurveAtTime: vi.fn<AudioParam['setValueCurveAtTime']>(),
    cancelScheduledValues: vi.fn<AudioParam['cancelScheduledValues']>(),
    cancelAndHoldAtTime: vi.fn<AudioParam['cancelAndHoldAtTime']>()
  };
}

function createMockOscillatorNode(): OscillatorNode {
  return {
    type: 'triangle',
    frequency: createMockAudioParam(),
    detune: createMockAudioParam(),
    onended: null,
    context: {} as BaseAudioContext,
    numberOfInputs: 0,
    numberOfOutputs: 1,
    channelCount: 2,
    channelCountMode: 'max',
    channelInterpretation: 'speakers',
    connect: vi.fn() as OscillatorNode['connect'],
    disconnect: vi.fn() as OscillatorNode['disconnect'],
    setPeriodicWave: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn((_: Event) => true)
  };
}

function createMockDynamicCompressorNode(): DynamicsCompressorNode {
  return {
    threshold: createMockAudioParam(),
    knee: createMockAudioParam(),
    ratio: createMockAudioParam(),
    reduction: 0,
    attack: createMockAudioParam(),
    release: createMockAudioParam(),
    context: {} as BaseAudioContext,
    numberOfInputs: 1,
    numberOfOutputs: 1,
    channelCount: 2,
    channelCountMode: 'max',
    channelInterpretation: 'speakers',
    connect: vi.fn() as DynamicsCompressorNode['connect'],
    disconnect: vi.fn() as DynamicsCompressorNode['disconnect'],
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn((_: Event) => true)
  };
}

function createMockAudioBuffer(data: number[]): AudioBuffer {
  const bufferLength = data.length;
  const mockSampleRate = 44100;

  return {
    duration: bufferLength / mockSampleRate,
    length: bufferLength,
    numberOfChannels: 1,
    sampleRate: mockSampleRate,
    getChannelData: vi.fn(() => new Float32Array(data)),
    copyFromChannel: vi.fn() as AudioBuffer['copyFromChannel'],
    copyToChannel: vi.fn() as AudioBuffer['copyToChannel']
  };
}
