/*!
 * Copyright 2022 Cognite AS
 */

import { createRevealManager } from './createRevealManager';

import { ModelDataProvider, ModelMetadataProvider } from '@reveal/modeldata-api';

import { Mock } from 'moq.ts';

import * as THREE from 'three';

describe('createRevealManager', () => {
  test('createRevealManager does not throw on empty internal options', () => {
    expect(() =>
      createRevealManager(
        'some-project',
        'some-application-id',
        new Mock<ModelMetadataProvider>().object(),
        new Mock<ModelDataProvider>().object(),
        new Mock<THREE.WebGLRenderer>().object(),
        new THREE.Scene(),
        {}
      )
    ).not.toThrow();
  });
});
