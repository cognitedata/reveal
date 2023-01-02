/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { TransformOverrideBuffer } from './TransformOverrideBuffer';

import { jest } from '@jest/globals';

describe('TransformOverrideBuffer', () => {
  const onGenerateNewTextureCb: (texture: THREE.DataTexture) => void = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('dispose() disposes texture', () => {
    const buffer = new TransformOverrideBuffer(onGenerateNewTextureCb);
    const texture = buffer.dataTexture;
    const listener = jest.fn();
    texture.addEventListener('dispose', listener);

    buffer.dispose();

    expect(listener).toBeCalledTimes(1);
  });

  test('addOverrideTransform called many times, triggers reallocation', () => {
    const buffer = new TransformOverrideBuffer(onGenerateNewTextureCb);
    for (let i = 0; i < 1000; i++) {
      buffer.addOverrideTransform(i, new THREE.Matrix4());
    }
    expect(onGenerateNewTextureCb).toBeCalled();
  });

  test('consecutive add/removeOverrideTransform doesnt allocate new texture', () => {
    const buffer = new TransformOverrideBuffer(onGenerateNewTextureCb);
    for (let i = 0; i < 1000; i++) {
      buffer.addOverrideTransform(i, new THREE.Matrix4());
      buffer.removeOverrideTransform(i);
    }
    expect(onGenerateNewTextureCb).not.toBeCalled();
  });
});
