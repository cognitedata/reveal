/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { IndexSet } from '../../../utilities/IndexSet';

import { OutlineColor } from '../NodeAppearance';
import { FixedNodeSet } from './FixedNodeSet';

import { NodeSet } from './NodeSet';
import { NodeStyleProvider } from './NodeStyleProvider';
import { NodeStyleTextureBuilder } from './NodeStyleTextureBuilder';

describe('NodeStyleTextureBuilder', () => {
  let styleProvider: NodeStyleProvider;
  let builder: NodeStyleTextureBuilder;
  let nodeSet: NodeSet;

  beforeEach(() => {
    styleProvider = new NodeStyleProvider();
    builder = new NodeStyleTextureBuilder(1, styleProvider);
    nodeSet = new FixedNodeSet([0]);
  });

  test('needsUpdate is initially true', () => {
    expect(builder.needsUpdate).toBeTrue();
  });

  test('needsUpdate() reset to false after build()', () => {
    builder.build();
    expect(builder.needsUpdate).toBeFalse();
  });

  test('needsUpdate() is true after style provider is changed', () => {
    builder.build(); // Reset needsUpdate
    styleProvider.addStyledSet(nodeSet, { renderGhosted: true });
    expect(builder.needsUpdate).toBeTrue();
  });

  test('build() applies color override', () => {
    styleProvider.addStyledSet(nodeSet, { color: [128, 255, 64] });
    builder.build();

    const texels = Array.from(builder.overrideColorPerTreeIndexTexture.image.data);
    expect(texels).toEqual([128, 255, 64, 1]);
  });

  test('build() applies hidden', () => {
    styleProvider.addStyledSet(nodeSet, { visible: false });
    builder.build();

    const texels = Array.from(builder.overrideColorPerTreeIndexTexture.image.data);
    expect(texels).toEqual([0, 0, 0, 0]);
  });

  test('build() applies in front', () => {
    styleProvider.addStyledSet(nodeSet, { renderInFront: true });
    builder.build();

    const texels = Array.from(builder.overrideColorPerTreeIndexTexture.image.data);
    expect(texels).toEqual([0, 0, 0, 3]);
  });

  test('build() applies ghost mode', () => {
    styleProvider.addStyledSet(nodeSet, { renderGhosted: true });
    builder.build();

    const texels = Array.from(builder.overrideColorPerTreeIndexTexture.image.data);
    expect(texels).toEqual([0, 0, 0, 5]);
  });

  test('build() applies outline', () => {
    styleProvider.addStyledSet(nodeSet, { outlineColor: OutlineColor.Orange });
    builder.build();

    const texels = Array.from(builder.overrideColorPerTreeIndexTexture.image.data);
    expect(texels).toEqual([0, 0, 0, 1 + (OutlineColor.Orange << 3)]);
  });

  test('build() applies transform', () => {
    // Arrange
    builder.build();
    const originalLookupTexels = Array.from(builder.overrideTransformPerTreeIndexTexture.image.data);
    const originalTransformLookupTexels = Array.from(builder.transformsLookupTexture.image.data);

    // Act
    const transform = new THREE.Matrix4().setPosition(10, 11, 12);
    styleProvider.addStyledSet(nodeSet, { worldTransform: transform });
    builder.build();

    // Assert
    const lookupTexels = Array.from(builder.overrideTransformPerTreeIndexTexture.image.data);
    expect(lookupTexels.length).toEqual(3);
    expect(lookupTexels).not.toEqual(originalLookupTexels);

    const transformTexels = Array.from(builder.transformsLookupTexture.image.data);
    expect(transformTexels.length).toBeGreaterThan(0);
    expect(transformTexels).not.toEqual(originalTransformLookupTexels);
  });

  test('build() adds new ghosted indices to correct set', () => {
    builder.build();
    expect(builder.regularNodeTreeIndices).toEqual(new IndexSet([0]));
    expect(builder.ghostedNodeTreeIndices).toEqual(new IndexSet([]));

    styleProvider.addStyledSet(nodeSet, { renderGhosted: true });
    builder.build();

    expect(builder.regularNodeTreeIndices).toEqual(new IndexSet([]));
    expect(builder.ghostedNodeTreeIndices).toEqual(new IndexSet([0]));
  });

  test('build() adds new infront indices to correct set', () => {
    builder.build();
    expect(builder.regularNodeTreeIndices).toEqual(new IndexSet([0]));
    expect(builder.infrontNodeTreeIndices).toEqual(new IndexSet([]));

    styleProvider.addStyledSet(nodeSet, { renderInFront: true });
    builder.build();

    expect(builder.regularNodeTreeIndices).toEqual(new IndexSet([]));
    expect(builder.infrontNodeTreeIndices).toEqual(new IndexSet([0]));
  });
});
