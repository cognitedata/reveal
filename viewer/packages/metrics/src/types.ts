/*!
 * Copyright 2021 Cognite AS
 */

import { Mock, UnknownFunction } from 'jest-mock';

export type TrackedEvents =
  | 'init'
  | 'construct3dViewer'
  | 'loadModel'
  | 'error'
  | 'cameraNavigated'
  | 'sessionEnded'
  | 'toolCreated'
  | 'cadModelStyleAssigned'
  | 'cadNodeTransformOverridden'
  | '360ImageCollectionAdded'
  | '360ImageEntered'
  | '360ImageTransitioned'
  | '360ImageExited'
  | 'measurementAdded'
  | 'texturedModelLoaded';

export type EventProps = {
  [key: string]: any;
};

export type RequiredOfflineAudioContext = Pick<
  OfflineAudioContext,
  'currentTime' | 'destination' | 'createOscillator' | 'createDynamicsCompressor' | 'startRendering'
>;

export type RequiredDynamicsCompressorNode = Pick<
  DynamicsCompressorNode,
  'threshold' | 'knee' | 'ratio' | 'reduction' | 'attack' | 'release' | 'connect'
>;

export type MockedDocument = {
  createElement: Mock<
    () => {
      getContext: Mock<
        () => {
          textBaseline: string;
          font: string;
          fillStyle: string;
          fillRect: Mock<(...args: any[]) => any>;
          fillText: Mock<(...args: any[]) => any>;
        }
      >;
      toDataURL: Mock<() => string>;
    }
  >;
};

export type GlobalDependencies = {
  document: Document | MockedDocument;
  OfflineAudioContext: typeof window.OfflineAudioContext | Mock<UnknownFunction>;
};
