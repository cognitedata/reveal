/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { determinePowerOfTwoDimensions } from '../../../utilities/determinePowerOfTwoDimensions';
import { NodeAppearance } from '../NodeAppearance';
import { IndexSet } from './IndexSet';
import { NodeStyleProvider } from './NodeStyleProvider';

export class NodeStyleTextureBuilder {
  private readonly _styleProvider: NodeStyleProvider;
  private readonly _handleStylesChangedListener = this.handleStylesChanged.bind(this);

  private _needsUpdate = true;
  private readonly _overrideColorPerTreeIndexTexture: THREE.DataTexture;
  private readonly _overrideTransformPerTreeIndexTexture: THREE.DataTexture;

  constructor(treeIndexCount: number, styleProvider: NodeStyleProvider) {
    this._styleProvider = styleProvider;
    this._styleProvider.on('changed', this._handleStylesChangedListener);

    const textures = allocateTextures(treeIndexCount);
    this._overrideColorPerTreeIndexTexture = textures.overrideColorPerTreeIndexTexture;
    this._overrideTransformPerTreeIndexTexture = textures.transformOverrideIndexTexture;
  }

  get needsUpdate(): boolean {
    return this._needsUpdate;
  }

  get overrideColorPerTreeIndexTexture(): THREE.DataTexture {
    return this._overrideColorPerTreeIndexTexture;
  }

  get overrideTransformPerTreeIndexTexture(): THREE.DataTexture {
    return this._overrideTransformPerTreeIndexTexture;
  }

  dispose() {
    this._styleProvider.off('changed', this._handleStylesChangedListener);
    this._overrideColorPerTreeIndexTexture.dispose();
    this._overrideTransformPerTreeIndexTexture.dispose();
  }

  build() {
    this._styleProvider.applyStyles((_styleId, treeIndices, style) => {
      const colorRgba = appearanceToColorOverride(style);
      const transformRgb = appearanceToTransformOverride(style);

      applyRGBA(this._overrideColorPerTreeIndexTexture, treeIndices, colorRgba);
      applyRGB(this._overrideTransformPerTreeIndexTexture, treeIndices, transformRgb);
    });
    this._needsUpdate = false;
  }

  private handleStylesChanged() {
    this._needsUpdate = true;
  }
}

function allocateTextures(
  treeIndexCount: number
): { overrideColorPerTreeIndexTexture: THREE.DataTexture; transformOverrideIndexTexture: THREE.DataTexture } {
  const { width, height } = determinePowerOfTwoDimensions(treeIndexCount);

  // Color and style override texture
  const colors = new Uint8Array(4 * treeIndexCount);
  // Set alpha to 1
  for (let i = 0; i < treeIndexCount; ++i) {
    colors[4 * i + 3] = 1;
  }
  const overrideColorPerTreeIndexTexture = new THREE.DataTexture(colors, width, height);

  // Texture for holding node transforms (translation, scale, rotation)
  const transformOverrideIndexBuffer = new Uint8ClampedArray(treeIndexCount * 3);
  const transformOverrideIndexTexture = new THREE.DataTexture(
    transformOverrideIndexBuffer,
    width,
    height,
    THREE.RGBFormat
  );

  return { overrideColorPerTreeIndexTexture, transformOverrideIndexTexture };
}

function appearanceToColorOverride(appearance: NodeAppearance): [number, number, number, number] {
  const [r, g, b] = appearance.color || [0, 0, 0];
  const isVisible = appearance.visible !== undefined ? !!appearance.visible : true;
  const inFront = !!appearance.renderInFront;
  const ghosted = !!appearance.renderGhosted;
  const outlineColor = appearance.outlineColor ? appearance.outlineColor : 0;
  // Byte layout:
  // [isVisible, renderInFront, renderGhosted, outlineColor0, outlineColor1, outlineColor2, unused, unused]
  const bytePattern = (isVisible ? 1 << 0 : 0) + (inFront ? 1 << 1 : 0) + (ghosted ? 1 << 2 : 0) + (outlineColor << 3);

  return [r, g, b, bytePattern];
}

function appearanceToTransformOverride(apperance: NodeAppearance): [number, number, number] {
  return [0, 0, 0];
}

function applyRGBA(texture: THREE.DataTexture, treeIndices: IndexSet, rgba: [number, number, number, number]) {
  const buffer = texture.image.data;
  const [r, g, b, a] = rgba;
  for (const treeIndex of treeIndices.values()) {
    buffer[4 * treeIndex + 0] = r;
    buffer[4 * treeIndex + 1] = g;
    buffer[4 * treeIndex + 2] = b;
    buffer[4 * treeIndex + 3] = a;
  }
  texture.needsUpdate = true;
}

function applyRGB(texture: THREE.DataTexture, treeIndices: IndexSet, rgb: [number, number, number]) {
  const buffer = texture.image.data;
  const [r, g, b] = rgb;
  for (const treeIndex of treeIndices.values()) {
    buffer[3 * treeIndex + 0] = r;
    buffer[3 * treeIndex + 1] = g;
    buffer[3 * treeIndex + 2] = b;
  }
  texture.needsUpdate = true;
}
