/*!
 * Copyright 2025 Cognite AS
 */
import { jest } from '@jest/globals';

import {
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
      this.createOscillator = jest.fn<() => OscillatorNode>(createMockOscillatorNode);
      this.createDynamicsCompressor = jest.fn<() => DynamicsCompressorNode>(createMockDynamicCompressorNode);
      this.destination = createMockAudioDestinationNode();
      this.startRendering = jest.fn(() => {
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
    connect: jest.fn() as AudioDestinationNode['connect'],
    disconnect: jest.fn() as AudioDestinationNode['disconnect'],
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn() as AudioDestinationNode['dispatchEvent']
  };
}

export function createMockDocument(): PartialDocument {
  const mockContext: GetContextReturnType = {
    textBaseline: 'middle',
    font: '',
    fillStyle: '',
    fillRect: jest.fn(),
    fillText: jest.fn()
  };

  const mockCanvas: ReturnType<PartialDocument['createElement']> = {
    getContext: jest.fn((_: '2d') => mockContext),
    toDataURL: jest.fn(() => 'data:image/png;base64,mock-data')
  };

  return {
    createElement: jest.fn((_: 'canvas') => mockCanvas)
  };
}

function createMockAudioParam(): AudioParam {
  return {
    automationRate: 'a-rate',
    defaultValue: 0,
    maxValue: 1,
    minValue: 0,
    value: 0,

    setValueAtTime: jest.fn<AudioParam['setValueAtTime']>(),
    linearRampToValueAtTime: jest.fn<AudioParam['linearRampToValueAtTime']>(),
    exponentialRampToValueAtTime: jest.fn<AudioParam['exponentialRampToValueAtTime']>(),
    setTargetAtTime: jest.fn<AudioParam['setTargetAtTime']>(),
    setValueCurveAtTime: jest.fn<AudioParam['setValueCurveAtTime']>(),
    cancelScheduledValues: jest.fn<AudioParam['cancelScheduledValues']>(),
    cancelAndHoldAtTime: jest.fn<AudioParam['cancelAndHoldAtTime']>()
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
    connect: jest.fn() as OscillatorNode['connect'],
    disconnect: jest.fn() as OscillatorNode['disconnect'],
    setPeriodicWave: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn((_: Event) => true)
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
    connect: jest.fn() as DynamicsCompressorNode['connect'],
    disconnect: jest.fn() as DynamicsCompressorNode['disconnect'],
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn((_: Event) => true)
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
    getChannelData: jest.fn(() => new Float32Array(data)),
    copyFromChannel: jest.fn() as AudioBuffer['copyFromChannel'],
    copyToChannel: jest.fn() as AudioBuffer['copyToChannel']
  };
}
