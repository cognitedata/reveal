/*!
 * Copyright 2026 Cognite AS
 */

import { Color } from 'three';
import { getSharedGradientTexture } from './texture-generation';
import type { IGradient } from './types';

describe(getSharedGradientTexture.name, () => {
  const createGradient = (): IGradient => [
    [0, new Color(0, 0, 0)],
    [1, new Color(1, 1, 1)]
  ];

  test('returns the same texture instance for the same gradient reference', () => {
    const gradient = createGradient();

    expect(getSharedGradientTexture(gradient)).toBe(getSharedGradientTexture(gradient));
  });

  test('returns distinct textures for distinct gradient references', () => {
    expect(getSharedGradientTexture(createGradient())).not.toBe(getSharedGradientTexture(createGradient()));
  });
});
