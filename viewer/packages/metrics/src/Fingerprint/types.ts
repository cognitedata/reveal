/*!
 * Copyright 2025 Cognite AS
 */
export type RequiredOfflineAudioContext = Pick<
  OfflineAudioContext,
  'currentTime' | 'destination' | 'createOscillator' | 'createDynamicsCompressor' | 'startRendering'
>;

export type OfflineAudioContextCompressorInstance = ReturnType<RequiredOfflineAudioContext['createDynamicsCompressor']>;

export type RequiredDynamicsCompressorNode = Pick<
  DynamicsCompressorNode,
  'threshold' | 'knee' | 'ratio' | 'reduction' | 'attack' | 'release' | 'connect'
>;

export type GetContextReturnType = Pick<
  CanvasRenderingContext2D,
  'textBaseline' | 'font' | 'fillStyle' | 'fillRect' | 'fillText'
>;

export type PartialDocument = {
  createElement: (type: 'canvas') => {
    getContext: (type: '2d') => GetContextReturnType;
    toDataURL: () => string;
  };
};

export type PartialOfflineAudioContextInstance = {
  currentTime: RequiredOfflineAudioContext['currentTime'];
  destination: RequiredOfflineAudioContext['destination'];
  createOscillator: () => ReturnType<RequiredOfflineAudioContext['createOscillator']>;
  createDynamicsCompressor: () => ReturnType<RequiredOfflineAudioContext['createDynamicsCompressor']>;
  startRendering: () => Promise<AudioBuffer>;
};

export type PartialOfflineAudioContext = {
  new (numberOfChannels: number, length: number, sampleRate: number): PartialOfflineAudioContextInstance;
};

export type GlobalDependencies = {
  document: PartialDocument;
  OfflineAudioContext: PartialOfflineAudioContext;
};
