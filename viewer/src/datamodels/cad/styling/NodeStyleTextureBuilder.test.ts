/*!
 * Copyright 2021 Cognite AS
 */

import { OutlineColor } from '../NodeAppearance';
import { FixedNodeSet } from './FixedNodeSet';
import { IndexSet } from './IndexSet';
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
    nodeSet = new FixedNodeSet(new IndexSet([0]));
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
});
