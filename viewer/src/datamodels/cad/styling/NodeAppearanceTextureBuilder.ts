/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { determinePowerOfTwoDimensions } from '../../../utilities/determinePowerOfTwoDimensions';

import { DefaultNodeAppearance, NodeAppearance } from '../NodeAppearance';
import { IndexSet } from '../../../utilities/IndexSet';
import { NodeAppearanceProvider } from './NodeAppearanceProvider';
import { NumericRange } from '../../../utilities';

export class NodeAppearanceTextureBuilder {
  private _defaultAppearance: NodeAppearance = {};
  private readonly _styleProvider: NodeAppearanceProvider;
  private readonly _handleStylesChangedListener = this.handleStylesChanged.bind(this);

  private _needsUpdate = true;
  // private readonly _treeIndexCount: number;
  private readonly _allTreeIndices: IndexSet;
  private readonly _overrideColorPerTreeIndexTexture: THREE.DataTexture;
  private readonly _regularNodesTreeIndices: IndexSet;
  private readonly _ghostedNodesTreeIndices: IndexSet;
  private readonly _infrontNodesTreeIndices: IndexSet;

  constructor(treeIndexCount: number, styleProvider: NodeAppearanceProvider) {
    // this._treeIndexCount = treeIndexCount;
    this._allTreeIndices = new IndexSet();
    this._allTreeIndices.addRange(new NumericRange(0, treeIndexCount));
    this._styleProvider = styleProvider;
    this._styleProvider.on('changed', this._handleStylesChangedListener);

    const textures = allocateTextures(treeIndexCount);
    this._overrideColorPerTreeIndexTexture = textures.overrideColorPerTreeIndexTexture;
    this._regularNodesTreeIndices = new IndexSet();
    this._ghostedNodesTreeIndices = new IndexSet();
    this._infrontNodesTreeIndices = new IndexSet();

    this.setDefaultAppearance(DefaultNodeAppearance.Default);
  }

  getDefaultAppearance(): NodeAppearance {
    return this._defaultAppearance;
  }

  /**
   * Sets the default style and invalidates the builder. Note that this causes a full
   * recomputation of values the next time {@link build} is called, so using this might be
   * expensive.
   * @param appearance New style that is applied to all 'unstyled' elements.
   */
  setDefaultAppearance(appearance: NodeAppearance) {
    // if (equalNodeAppearances(appearance, this._defaultAppearance)) return;
    this._defaultAppearance = appearance;
    this._needsUpdate = true;
  }

  get regularNodeTreeIndices(): IndexSet {
    return this._regularNodesTreeIndices;
  }

  get ghostedNodeTreeIndices(): IndexSet {
    return this._ghostedNodesTreeIndices;
  }

  get infrontNodeTreeIndices(): IndexSet {
    return this._infrontNodesTreeIndices;
  }

  get needsUpdate(): boolean {
    return this._needsUpdate;
  }

  /**
   * A texture holding at least one element per node with color override
   * and style information. RGB is used to store color, A is used to store
   * style toggles, with the following bit layout:
   * - 0  : visible bit   - when set the node is visible
   * - 1  : in front bit  - when set the node is rendered in front of other objects
   * - 2  : ghosted bit   - when set the node is rendered 'ghosted'
   * - 3-5: outline color - outline toggle and color ({@see OutlineColor}).
   * - 6-7: unused
   * Note that in-front and ghost information also is available from
   * the {@see inFrontTreeIndices} and {@see ghostedTreeIndices} collections.
   */
  get overrideColorPerTreeIndexTexture(): THREE.DataTexture {
    return this._overrideColorPerTreeIndexTexture;
  }

  dispose() {
    this._styleProvider.off('changed', this._handleStylesChangedListener);
    this._overrideColorPerTreeIndexTexture.dispose();
  }

  build() {
    const start = performance.now();

    const rgba = this._overrideColorPerTreeIndexTexture.image.data;
    rgba.fill(0);

    this.applyStyleToNodes(this._allTreeIndices, { visible: true, ...this._defaultAppearance });
    let treeIndexAppliedCount = 0;
    this._styleProvider.applyStyles((_styleId, _revision, treeIndices, appearance) => {
      // Translate from style to magic values in textures
      const fullStyle = { ...this._defaultAppearance, ...appearance };
      this.applyStyleToNodes(treeIndices, fullStyle);
      treeIndexAppliedCount += treeIndices.count;
    });
    this._regularNodesTreeIndices.clear();
    this._infrontNodesTreeIndices.clear();
    this._ghostedNodesTreeIndices.clear();

    const range = {
      rangeStart: -1,
      inFront: false,
      ghosted: false
    };

    const commitRange = (toExclusive: number) => {
      const treeIndexRange = NumericRange.createFromInterval(range.rangeStart, toExclusive - 1);
      if (range.inFront) {
        this._infrontNodesTreeIndices.addRange(treeIndexRange);
      } else if (range.ghosted) {
        this._ghostedNodesTreeIndices.addRange(treeIndexRange);
      } else {
        this._regularNodesTreeIndices.addRange(treeIndexRange);
      }
    };

    for (let i = 0; i < this._allTreeIndices.count; ++i) {
      const inFront = (rgba[4 * i + 3] & 2) !== 0;
      const ghosted = (rgba[4 * i + 3] & 4) !== 0;
      if (range.rangeStart === -1) {
        range.rangeStart = i;
        range.inFront = inFront;
        range.ghosted = ghosted;
      } else if (range.inFront !== inFront || range.ghosted !== ghosted) {
        commitRange(i);
        range.rangeStart = i;
        range.inFront = inFront;
        range.ghosted = ghosted;
      }
    }
    if (range.rangeStart !== -1) {
      commitRange(this._allTreeIndices.count);
    }

    this._overrideColorPerTreeIndexTexture.needsUpdate = true;
    this._needsUpdate = false;
    console.log(`build() took ${performance.now() - start} ms for ${treeIndexAppliedCount} nodes with style`);
    (window as any).timings = [...((window as any).timings || []), performance.now() - start];
  }

  private applyStyleToNodes(treeIndices: IndexSet, style: NodeAppearance) {
    if (treeIndices.count === 0) {
      return;
    }

    applyRGBA(this._overrideColorPerTreeIndexTexture.image.data, treeIndices, style);
  }

  private handleStylesChanged() {
    this._needsUpdate = true;
  }
}

function allocateTextures(
  treeIndexCount: number
): { overrideColorPerTreeIndexTexture: THREE.DataTexture; transformOverrideIndexTexture: THREE.DataTexture } {
  const { width, height } = determinePowerOfTwoDimensions(treeIndexCount);
  const textureElementCount = width * height;

  // Color and style override texture
  const overrideColorPerTreeIndexTexture = new THREE.DataTexture(
    new Uint8ClampedArray(4 * textureElementCount),
    width,
    height
  );

  // Texture for holding node transforms (translation, scale, rotation)
  const transformOverrideIndexBuffer = new Uint8ClampedArray(3 * textureElementCount);
  const transformOverrideIndexTexture = new THREE.DataTexture(
    transformOverrideIndexBuffer,
    width,
    height,
    THREE.RGBFormat
  );

  return { overrideColorPerTreeIndexTexture, transformOverrideIndexTexture };
}

function appearanceToColorOverride(appearance: NodeAppearance): [number, number, number] {
  const [r, g, b] = appearance.color || [0, 0, 0];
  return [r, g, b];
}

function mixAlpha(current: number, updateStyle: NodeAppearance): number {
  /*
   * - 0  : visible bit   - when set the node is visible
   * - 1  : in front bit  - when set the node is rendered in front of other objects
   * - 2  : ghosted bit   - when set the node is rendered 'ghosted'
   * - 3-5: outline color - outline toggle and color ({@see OutlineColor}).
   * - 6-7: unused
   */
  let updated = current;
  if (updateStyle.visible !== undefined) {
    updated = (updated & 0x11111110) | (updateStyle.visible ? 1 : 0);
  }
  if (updateStyle.renderInFront !== undefined) {
    updated = (updated & 0x11111101) | (updateStyle.renderInFront ? 2 : 0);
  }
  if (updateStyle.renderGhosted !== undefined) {
    updated = (updated & 0x11111011) | (updateStyle.renderGhosted ? 4 : 0);
  }
  if (updateStyle.outlineColor !== undefined) {
    updated = (updated & 0x11000111) | (updateStyle.outlineColor << 3);
  }
  return updated;
}

function applyRGBA(rgbaBuffer: Uint8ClampedArray, treeIndices: IndexSet, style: NodeAppearance) {
  const [r, g, b] = appearanceToColorOverride(style);
  treeIndices.forEachRange(range => {
    for (let i = range.from; i <= range.toInclusive; ++i) {
      if (style.color !== undefined) {
        rgbaBuffer[4 * i + 0] = r;
        rgbaBuffer[4 * i + 1] = g;
        rgbaBuffer[4 * i + 2] = b;
      }
      rgbaBuffer[4 * i + 3] = mixAlpha(rgbaBuffer[4 * i + 3], style);
    }
  });
}
