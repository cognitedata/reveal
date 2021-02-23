/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { IndexSet } from '../../../utilities/IndexSet';

import { NodeAppearance, OutlineColor } from '../NodeAppearance';
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

  test('add then remove index from set, resets styling', () => {
    const set = new FixedNodeSet(new IndexSet([0]));
    const style: NodeAppearance = { color: [127, 128, 192], visible: false };
    styleProvider.addStyledSet(set, style);

    builder.build();
    let texels = Array.from(builder.overrideColorPerTreeIndexTexture.image.data);
    expect(texels).toEqual([127, 128, 192, 0]);

    set.updateSet(new IndexSet([]));
    builder.build();
    texels = Array.from(builder.overrideColorPerTreeIndexTexture.image.data);
    expect(texels).toEqual([0, 0, 0, 1]);
  });

  test('setDefaultStyle() triggers needs update', () => {
    builder.build(); // Clear needsUpdate
    expect(builder.needsUpdate).toBeFalse();

    builder.setDefaultStyle({ renderGhosted: true, outlineColor: OutlineColor.Blue });
    expect(builder.needsUpdate).toBeTrue();
  });

  test('setDefaultStyle() causes computer recompute the next time build() is called', () => {
    builder.setDefaultStyle({ color: [244, 133, 66], visible: false });
    builder.build();

    const texels = Array.from(builder.overrideColorPerTreeIndexTexture.image.data);
    expect(texels).toEqual([244, 133, 66, 0]);
  });

  test('setDefaultStyle() has effect for unset fields in styled sets', () => {
    builder.setDefaultStyle({ color: [1, 2, 3], renderGhosted: true });
    styleProvider.addStyledSet(new FixedNodeSet([0]), { renderGhosted: false });
    builder.build();

    const texels = Array.from(builder.overrideColorPerTreeIndexTexture.image.data);
    expect(texels).toEqual([1, 2, 3, 1]); // Color is from default style, but 'renderGhosted' from styled set
  });

  test('setDefaultStyle() recomputes geometry type collections', () => {
    const builder = new NodeStyleTextureBuilder(3, styleProvider);
    styleProvider.addStyledSet(new FixedNodeSet([1]), { renderGhosted: true });
    styleProvider.addStyledSet(new FixedNodeSet([2]), { renderInFront: true });

    builder.build();
    expect(builder.regularNodeTreeIndices).toEqual(new IndexSet([0]));
    expect(builder.ghostedNodeTreeIndices).toEqual(new IndexSet([1]));
    expect(builder.infrontNodeTreeIndices).toEqual(new IndexSet([2]));

    builder.setDefaultStyle({ renderGhosted: true });
    builder.build();
    expect(builder.ghostedNodeTreeIndices).toEqual(new IndexSet([0, 1]));
    expect(builder.regularNodeTreeIndices).toEqual(new IndexSet());

    builder.setDefaultStyle({ renderInFront: true });
    builder.build();
    expect(builder.infrontNodeTreeIndices).toEqual(new IndexSet([0, 2]));
    expect(builder.regularNodeTreeIndices).toEqual(new IndexSet());
  });
});
