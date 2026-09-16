/*!
 * Copyright 2021 Cognite AS
 */
import type { DataTexture } from 'three';
import { Matrix4 } from 'three';
import { TransformOverrideBuffer } from './TransformOverrideBuffer';

import { vi } from 'vitest';

describe('TransformOverrideBuffer', () => {
  const onGenerateNewTextureCb: (texture: DataTexture) => void = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('dispose() disposes texture', () => {
    const buffer = new TransformOverrideBuffer(onGenerateNewTextureCb);
    const texture = buffer.dataTexture;
    const listener = vi.fn();
    texture.addEventListener('dispose', listener);

    buffer.dispose();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('addOverrideTransform called many times, triggers reallocation', () => {
    const buffer = new TransformOverrideBuffer(onGenerateNewTextureCb);
    for (let i = 0; i < 1000; i++) {
      buffer.addOverrideTransform(i, new Matrix4());
    }
    expect(onGenerateNewTextureCb).toHaveBeenCalled();
  });

  test('consecutive add/removeOverrideTransform doesnt allocate new texture', () => {
    const buffer = new TransformOverrideBuffer(onGenerateNewTextureCb);
    for (let i = 0; i < 1000; i++) {
      buffer.addOverrideTransform(i, new Matrix4());
      buffer.removeOverrideTransform(i);
    }
    expect(onGenerateNewTextureCb).not.toHaveBeenCalled();
  });
});
