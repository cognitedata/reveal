/*!
 * Copyright 2026 Cognite AS
 */

import { Fn, floor, float, int, ivec2, mat4, mod, textureLoad, vec4 } from 'three/tsl';

export const nodeAppearanceFromTexel = Fn(([nodeAppearanceTexel]) => {
  const alphaUnwrapped = floor(nodeAppearanceTexel.a.mul(255.0).add(0.5));
  const isVisible = mod(floor(alphaUnwrapped.div(1)), 2).equal(1);
  const renderInFront = mod(floor(alphaUnwrapped.div(2)), 2).equal(1);
  const renderGhosted = mod(floor(alphaUnwrapped.div(4)), 2).equal(1);
  return { colorTexel: nodeAppearanceTexel, isVisible, renderInFront, renderGhosted };
});

export const determineNodeAppearance = Fn(([nodeAppearanceTexture, textureSize, treeIndex]) => {
  const dataTextureWidth = int(textureSize.x);
  const iTreeIndex = int(treeIndex);
  const xTreeIndexTextureCoord = iTreeIndex.mod(dataTextureWidth);
  const yTreeIndexTextureCoord = iTreeIndex.div(dataTextureWidth);
  const texel = textureLoad(nodeAppearanceTexture, ivec2(xTreeIndexTextureCoord, yTreeIndexTextureCoord));
  return nodeAppearanceFromTexel(texel);
});

export const determineColor = Fn(([originalColor, nodeAppearanceTexel]) => {
  const overrideColor = nodeAppearanceTexel;
  const hasOverride = overrideColor.r.greaterThan(0).or(overrideColor.g.greaterThan(0)).or(overrideColor.b.greaterThan(0));
  return hasOverride.select(overrideColor, vec4(originalColor, overrideColor.a));
});

export const determineVisibility = Fn(([appearance, renderMode]) => {
  const ghost = renderMode.equal(7).and(appearance.renderGhosted);
  const inFront = renderMode.equal(6).and(appearance.renderInFront);
  const back = renderMode.equal(1).and(appearance.renderGhosted.not()).and(appearance.renderInFront.not());
  const other = renderMode.notEqual(1)
    .and(renderMode.notEqual(6))
    .and(renderMode.notEqual(7))
    .and(appearance.renderGhosted.not());
  return appearance.isVisible.and(ghost.or(inFront).or(back).or(other));
});

export const determineMatrixOverride = Fn(
  ([treeIndex, treeIndexTextureSize, transformOverrideIndexTexture, transformOverrideTextureSize, transformOverrideTexture]) => {
    const dataTextureWidth = treeIndexTextureSize.x;
    const xTreeIndexTextureCoord = int(mod(treeIndex, dataTextureWidth));
    const yTreeIndexTextureCoord = int(floor(treeIndex.div(dataTextureWidth)));
    const index = textureLoad(
      transformOverrideIndexTexture,
      ivec2(xTreeIndexTextureCoord, yTreeIndexTextureCoord)
    ).r;

    const identity = mat4(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );

    const hasOverride = index.notEqual(0);
    const adjustedIndex = index.sub(1);

    const e0 = textureLoad(transformOverrideTexture, ivec2(adjustedIndex.mul(16).add(0), 0)).r;
    const e1 = textureLoad(transformOverrideTexture, ivec2(adjustedIndex.mul(16).add(1), 0)).r;
    const e2 = textureLoad(transformOverrideTexture, ivec2(adjustedIndex.mul(16).add(2), 0)).r;
    const e3 = textureLoad(transformOverrideTexture, ivec2(adjustedIndex.mul(16).add(3), 0)).r;
    const e4 = textureLoad(transformOverrideTexture, ivec2(adjustedIndex.mul(16).add(4), 0)).r;
    const e5 = textureLoad(transformOverrideTexture, ivec2(adjustedIndex.mul(16).add(5), 0)).r;
    const e6 = textureLoad(transformOverrideTexture, ivec2(adjustedIndex.mul(16).add(6), 0)).r;
    const e7 = textureLoad(transformOverrideTexture, ivec2(adjustedIndex.mul(16).add(7), 0)).r;
    const e8 = textureLoad(transformOverrideTexture, ivec2(adjustedIndex.mul(16).add(8), 0)).r;
    const e9 = textureLoad(transformOverrideTexture, ivec2(adjustedIndex.mul(16).add(9), 0)).r;
    const e10 = textureLoad(transformOverrideTexture, ivec2(adjustedIndex.mul(16).add(10), 0)).r;
    const e11 = textureLoad(transformOverrideTexture, ivec2(adjustedIndex.mul(16).add(11), 0)).r;

    const overrideMatrix = mat4(
      e0, e4, e8, 0,
      e1, e5, e9, 0,
      e2, e6, e10, 0,
      e3, e7, e11, 1
    );

    return hasOverride.select(overrideMatrix, identity);
  }
);
