/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { NodeAppearance, NodeOutlineColor } from '@reveal/cad-styling';
import { NodeAppearanceTextureBuilder } from './NodeAppearanceTextureBuilder';

import { TreeIndexNodeCollection, NodeAppearanceProvider } from '@reveal/cad-styling';

import { IndexSet } from '@reveal/utilities';

import { Color } from 'three';

import { jest } from '@jest/globals';
import { createUint8View } from '@reveal/utilities/src/bufferUtils';

function toByteTuple(color: Color): [number, number, number] {
  return color.toArray().map(c => Math.round(c * 255)) as [number, number, number];
}

describe('NodeAppearanceTextureBuilder', () => {
  let styleProvider: NodeAppearanceProvider;
  let builder: NodeAppearanceTextureBuilder;
  let nodeCollection: TreeIndexNodeCollection;

  beforeEach(() => {
    jest.useFakeTimers();
    styleProvider = new NodeAppearanceProvider();
    builder = new NodeAppearanceTextureBuilder(1, styleProvider);
    nodeCollection = new TreeIndexNodeCollection([0]);
  });

  afterEach(() => {
    jest.useRealTimers();
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
    styleProvider.assignStyledNodeCollection(nodeCollection, { renderGhosted: true });
    jest.runAllTimers();
    expect(builder.needsUpdate).toBeTrue();
  });

  test('build() applies color override', () => {
    styleProvider.assignStyledNodeCollection(nodeCollection, { color: new Color(0.5, 1.0, 0.25) });
    jest.runAllTimers();
    builder.build();

    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([128, 255, 64, 1]);
  });

  test('build() applies hidden', () => {
    styleProvider.assignStyledNodeCollection(nodeCollection, { visible: false });
    jest.runAllTimers();
    builder.build();

    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([0, 0, 0, 0]);
  });

  test('build() applies in front', () => {
    styleProvider.assignStyledNodeCollection(nodeCollection, { renderInFront: true });
    jest.runAllTimers();
    builder.build();

    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([0, 0, 0, 3]);
  });

  test('build() applies ghost mode', () => {
    styleProvider.assignStyledNodeCollection(nodeCollection, { renderGhosted: true });
    jest.runAllTimers();
    builder.build();

    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([0, 0, 0, 5]);
  });

  test('build() applies outline', () => {
    styleProvider.assignStyledNodeCollection(nodeCollection, { outlineColor: NodeOutlineColor.Orange });
    jest.runAllTimers();
    builder.build();

    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([0, 0, 0, 1 + (NodeOutlineColor.Orange << 5)]);
  });

  test('build() adds new ghosted indices to correct set', () => {
    builder.build();
    expect(builder.regularNodeTreeIndices).toEqual(new IndexSet([0]));
    expect(builder.ghostedNodeTreeIndices).toEqual(new IndexSet([]));

    styleProvider.assignStyledNodeCollection(nodeCollection, { renderGhosted: true });
    jest.runAllTimers();
    builder.build();

    expect(builder.regularNodeTreeIndices).toEqual(new IndexSet([]));
    expect(builder.ghostedNodeTreeIndices).toEqual(new IndexSet([0]));
  });

  test('build() adds new infront indices to correct set', () => {
    builder.build();
    expect(builder.regularNodeTreeIndices).toEqual(new IndexSet([0]));
    expect(builder.infrontNodeTreeIndices).toEqual(new IndexSet([]));

    styleProvider.assignStyledNodeCollection(nodeCollection, { renderInFront: true });
    jest.runAllTimers();
    builder.build();

    expect(builder.regularNodeTreeIndices).toEqual(new IndexSet([]));
    expect(builder.infrontNodeTreeIndices).toEqual(new IndexSet([0]));
  });

  test('build() resets styles of removed node collections', () => {
    // Arrange
    styleProvider.assignStyledNodeCollection(nodeCollection, { renderGhosted: true });
    jest.runAllTimers();
    builder.build();
    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([0, 0, 0, 5]); // Alpha = 5 -> visible, ghosted

    // Act
    styleProvider.unassignStyledNodeCollection(nodeCollection);
    jest.runAllTimers();
    builder.build();

    // Assert
    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([0, 0, 0, 1]); // Alpha = 1 -> visible
  });

  test('build() resets styles of removed nodes', () => {
    // Arrange
    builder.build();
    const originalTexels = texelsOf(builder.overrideColorPerTreeIndexTexture);
    styleProvider.assignStyledNodeCollection(nodeCollection, { renderGhosted: true });
    jest.runAllTimers();
    builder.build();
    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).not.toEqual(originalTexels);

    // Act
    styleProvider.unassignStyledNodeCollection(nodeCollection);
    jest.runAllTimers();
    builder.build();

    // Assert
    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual(originalTexels);
  });

  test('add then remove index from set, resets styling', () => {
    const set = new TreeIndexNodeCollection(new IndexSet([0]));
    const style: NodeAppearance = { color: new Color(0.497, 0.5, 0.752), visible: false };
    styleProvider.assignStyledNodeCollection(set, style);
    jest.runAllTimers();

    builder.build();
    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([127, 128, 192, 0]);

    set.updateSet(new IndexSet([]));
    jest.runAllTimers();
    builder.build();

    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([0, 0, 0, 1]);
  });

  test('add custom color then updating superset without color keeps color', () => {
    // Need to do this here, as we want two elements in our buffer
    const builder = new NodeAppearanceTextureBuilder(2, styleProvider);

    const customColor = new Color(0.496, 0.5, 0.504);
    const expectedBytes = toByteTuple(customColor);

    const set = new TreeIndexNodeCollection(new IndexSet([0]));
    const style0: NodeAppearance = { color: customColor, visible: true };
    styleProvider.assignStyledNodeCollection(set, style0);

    jest.runAllTimers();
    builder.build();

    const superSet = new TreeIndexNodeCollection(new IndexSet([0, 1]));
    const style1: NodeAppearance = { visible: true };
    styleProvider.assignStyledNodeCollection(superSet, style1);

    jest.runAllTimers();
    builder.build();

    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)!.slice(0, 4)).toEqual([...expectedBytes, 1]);
  });

  test('add 0, 0, 0 color then updating default with custom color keeps original node color', () => {
    // Need to do this here, as we want two elements in our buffer
    const builder = new NodeAppearanceTextureBuilder(2, styleProvider);

    const black = new Color(0, 0, 0);
    const expectedBytes = toByteTuple(black);

    const set = new TreeIndexNodeCollection(new IndexSet([0]));
    const style0: NodeAppearance = { color: black, visible: true };
    styleProvider.assignStyledNodeCollection(set, style0);

    jest.runAllTimers();
    builder.build();

    const style1: NodeAppearance = { color: new Color(0.1, 0.2, 0.3) };
    builder.setDefaultAppearance(style1);

    jest.runAllTimers();
    builder.build();

    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)!.slice(0, 4)).toEqual([...expectedBytes, 1]);
  });

  test('setDefaultStyle() triggers needs update', () => {
    builder.build(); // Clear needsUpdate
    expect(builder.needsUpdate).toBeFalse();

    builder.setDefaultAppearance({ renderGhosted: true, outlineColor: NodeOutlineColor.Blue });
    expect(builder.needsUpdate).toBeTrue();
  });

  test('setDefaultStyle() causes computer recompute the next time build() is called', () => {
    builder.setDefaultAppearance({ color: new Color(0.955, 0.52, 0.26), visible: false });
    builder.build();

    expect(texelsOf(builder.overrideColorPerTreeIndexTexture)).toEqual([244, 133, 66, 0]);
  });

  test('setDefaultStyle() has effect for unset fields in styled sets', () => {
    builder.setDefaultAppearance({ color: new Color(0.004, 0.008, 0.011), renderGhosted: true });
    styleProvider.assignStyledNodeCollection(new TreeIndexNodeCollection([0]), { renderGhosted: false });
    jest.runAllTimers();
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
    styleProvider.assignStyledNodeCollection(new TreeIndexNodeCollection([1]), { renderGhosted: true });
    styleProvider.assignStyledNodeCollection(new TreeIndexNodeCollection([2]), { renderInFront: true });
    jest.runAllTimers();
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
  return Array.from(createUint8View(texture.image.data));
}
