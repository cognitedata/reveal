/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { IndexSet } from '../../../utilities/IndexSet';

import { NodeAppearance, NodeOutlineColor } from '../NodeAppearance';
import { FixedNodeSet } from './FixedNodeSet';

import { NodeAppearanceProvider } from './NodeAppearanceProvider';
import { NodeAppearanceTextureBuilder } from './NodeAppearanceTextureBuilder';

describe('NodeAppearanceTextureBuilder', () => {
  let styleProvider: NodeAppearanceProvider;
  let builder: NodeAppearanceTextureBuilder;
  let nodeSet: FixedNodeSet;

  beforeEach(() => {
    styleProvider = new NodeAppearanceProvider();
    builder = new NodeAppearanceTextureBuilder(1, styleProvider);
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

    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([128, 255, 64, 1]);
  });

  test('build() applies hidden', () => {
    styleProvider.addStyledSet(nodeSet, { visible: false });
    builder.build();

    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([0, 0, 0, 0]);
  });

  test('build() applies in front', () => {
    styleProvider.addStyledSet(nodeSet, { renderInFront: true });
    builder.build();

    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([0, 0, 0, 3]);
  });

  test('build() applies ghost mode', () => {
    styleProvider.addStyledSet(nodeSet, { renderGhosted: true });
    builder.build();

    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([0, 0, 0, 5]);
  });

  test('build() applies outline', () => {
    styleProvider.addStyledSet(nodeSet, { outlineColor: NodeOutlineColor.Orange });
    builder.build();

    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([0, 0, 0, 1 + (NodeOutlineColor.Orange << 3)]);
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

  test('build() resets styles of removed node sets', () => {
    // Arrange
    styleProvider.addStyledSet(nodeSet, { renderGhosted: true });
    builder.build();
    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([0, 0, 0, 5]); // Alpha = 5 -> visible, ghosted

    // Act
    styleProvider.removeStyledSet(nodeSet);
    builder.build();

    // Assert
    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([0, 0, 0, 1]); // Alpha = 1 -> visible
  });

  test('build() resets styles of removed nodes', () => {
    // Arrange
    const originalTexels = texelsOf(builder.overrideColorPerTreeIndexTexture);
    styleProvider.addStyledSet(nodeSet, { renderGhosted: true });
    builder.build();
    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).not.toEqual(originalTexels);

    // Act
    styleProvider.removeStyledSet(nodeSet);
    builder.build();

    // Assert
    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual(originalTexels);
  });

  test('add then remove index from set, resets styling', () => {
    const set = new FixedNodeSet(new IndexSet([0]));
    const style: NodeAppearance = { color: [127, 128, 192], visible: false };
    styleProvider.addStyledSet(set, style);

    builder.build();
    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([127, 128, 192, 0]);

    set.updateSet(new IndexSet([]));
    builder.build();

    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([0, 0, 0, 1]);
  });

  test('setDefaultStyle() triggers needs update', () => {
    builder.build(); // Clear needsUpdate
    expect(builder.needsUpdate).toBeFalse();

    builder.setDefaultAppearance({ renderGhosted: true, outlineColor: NodeOutlineColor.Blue });
    expect(builder.needsUpdate).toBeTrue();
  });

  test('setDefaultStyle() causes computer recompute the next time build() is called', () => {
    builder.setDefaultAppearance({ color: [244, 133, 66], visible: false });
    builder.build();

    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([244, 133, 66, 0]);
  });

  test('setDefaultStyle() has effect for unset fields in styled sets', () => {
    builder.setDefaultAppearance({ color: [1, 2, 3], renderGhosted: true });
    styleProvider.addStyledSet(new FixedNodeSet([0]), { renderGhosted: false });
    builder.build();

    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([1, 2, 3, 1]); // Color is from default style, but 'renderGhosted' from styled set
  });

  test('setDefaultStyle() recomputes geometry type collections', () => {
    const builder = new NodeAppearanceTextureBuilder(3, styleProvider);
    builder.build();
    // Initially, all nodes are 'regular'
    expect(builder.regularNodeTreeIndices).toEqual(new IndexSet([0, 1, 2]));
    expect(builder.ghostedNodeTreeIndices).toEqual(new IndexSet());
    expect(builder.infrontNodeTreeIndices).toEqual(new IndexSet());

    // Override settings for node 1+2, moving these into ghosted and infront sets
    styleProvider.addStyledSet(new FixedNodeSet([1]), { renderGhosted: true });
    styleProvider.addStyledSet(new FixedNodeSet([2]), { renderInFront: true });
    builder.build();
    expect(builder.regularNodeTreeIndices).toEqual(new IndexSet([0]));
    expect(builder.ghostedNodeTreeIndices).toEqual(new IndexSet([1]));
    expect(builder.infrontNodeTreeIndices).toEqual(new IndexSet([2]));

    // Make ghosted the default mode, adding node 0 to the ghosted set
    builder.setDefaultAppearance({ renderGhosted: true });
    builder.build();
    expect(builder.ghostedNodeTreeIndices).toEqual(new IndexSet([0, 1]));
    expect(builder.infrontNodeTreeIndices).toEqual(new IndexSet([2]));
    expect(builder.regularNodeTreeIndices).toEqual(new IndexSet());

    // Make infront the default mode, adding node 0 to the infront set
    builder.setDefaultAppearance({ renderInFront: true });
    builder.build();
    expect(builder.infrontNodeTreeIndices).toEqual(new IndexSet([0, 1, 2]));
    expect(builder.ghostedNodeTreeIndices).toEqual(new IndexSet());
    expect(builder.regularNodeTreeIndices).toEqual(new IndexSet());
  });
});

function texelsOf(texture: THREE.DataTexture): number[] | undefined {
  return Array.from(texture.image.data);
}
