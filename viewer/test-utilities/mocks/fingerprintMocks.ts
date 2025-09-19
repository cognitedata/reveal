/*!
 * Copyright 2025 Cognite AS
 */
import { jest } from '@jest/globals';

import { MockedDocument } from '@reveal/metrics/src/types';
import { Mock, UnknownFunction } from 'jest-mock';

export function createMockOfflineAudioContext(shouldSucceed: boolean): Mock<UnknownFunction> {
  return jest.fn().mockImplementation(() => {
    return {
      currentTime: 0,
      createOscillator: jest.fn(createMockOscillatorNode),
      createDynamicsCompressor: jest.fn(createMockDynamicCompressorNode),
      destination: {},
      startRendering: jest.fn(() => {
        if (shouldSucceed) {
          const mockData = Array.from({ length: 5000 }, (_, i) => (i > 4499 && i < 5000 ? 0.001 : 0));
          return Promise.resolve(createMockAudioBuffer(mockData));
        }
        return Promise.reject(new Error('Rendering failed.'));
      })
    };
  });
}

export function createMockDocument(): MockedDocument {
  const mockContext = {
    textBaseline: '',
    font: '',
    fillStyle: '',
    fillRect: jest.fn(),
    fillText: jest.fn()
  };

  const mockCanvas = {
    getContext: jest.fn(() => mockContext),
    toDataURL: jest.fn(() => 'data:image/png;base64,mock-data')
  };

  return {
    createElement: jest.fn(() => mockCanvas)
  };
}

function createMockAudioParam() {
  return {
    setValueAtTime: jest.fn()
  };
}

function createMockDynamicCompressorNode() {
  return {
    connect: jest.fn(),
    disconnect: jest.fn(),
    threshold: createMockAudioParam(),
    knee: createMockAudioParam(),
    ratio: createMockAudioParam(),
    reduction: createMockAudioParam(),
    attack: createMockAudioParam(),
    release: createMockAudioParam()
  };
}

function createMockOscillatorNode() {
  return {
    connect: jest.fn(),
    disconnect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    type: 'triangle',
    frequency: createMockAudioParam()
  };
}

function createMockAudioBuffer(data: number[]) {
  return {
    getChannelData: jest.fn(() => new Float32Array(data))
  };
}
