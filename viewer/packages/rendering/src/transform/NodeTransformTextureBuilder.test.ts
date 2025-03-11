/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { NumericRange, createUint8View } from '@reveal/utilities';
import { NodeTransformProvider } from './NodeTransformProvider';
import { NodeTransformTextureBuilder } from './NodeTransformTextureBuilder';

describe('NodeTransformTextureBuilder', () => {
  let transformProvider: NodeTransformProvider;
  let builder: NodeTransformTextureBuilder;

  beforeEach(() => {
    transformProvider = new NodeTransformProvider();
    builder = new NodeTransformTextureBuilder(16, transformProvider);
  });

  test('construct initializes texture', () => {
    expect(builder.transformLookupTexture).not.toBeUndefined();
    expect(builder.overrideTransformIndexTexture).not.toBeUndefined();
  });

  test('set transform in provider, change is applied to texture', () => {
    const originalLookupTexels = texelsOf(builder.transformLookupTexture);
    const originalIndexTexels = texelsOf(builder.overrideTransformIndexTexture);

    const matrix = new THREE.Matrix4().makeTranslation(10, 20, 30);
    transformProvider.setNodeTransform(new NumericRange(0, 16), matrix);
    builder.build();

    expect(texelsOf(builder.transformLookupTexture)).not.toEqual(originalLookupTexels);
    expect(texelsOf(builder.overrideTransformIndexTexture)).not.toEqual(originalIndexTexels);
  });

  test('reset transform in provider, restores index', () => {
    const originalIndexTexels = texelsOf(builder.overrideTransformIndexTexture);

    const matrix = new THREE.Matrix4().makeTranslation(10, 20, 30);
    transformProvider.setNodeTransform(new NumericRange(0, 16), matrix);
    transformProvider.resetNodeTransform(new NumericRange(0, 16));
    builder.build();

    expect(texelsOf(builder.overrideTransformIndexTexture)).toEqual(originalIndexTexels);
  });
});

function texelsOf(texture: THREE.DataTexture): number[] {
  return Array.from(createUint8View(texture.image.data));
}
