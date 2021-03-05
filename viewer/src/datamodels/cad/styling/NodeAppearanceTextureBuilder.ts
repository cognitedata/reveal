/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { NumericRange } from '../../../utilities';

import { determinePowerOfTwoDimensions } from '../../../utilities/determinePowerOfTwoDimensions';

import { DefaultNodeAppearance, NodeAppearance } from '../NodeAppearance';
import { IndexSet } from '../../../utilities/IndexSet';
import { NodeAppearanceProvider } from './NodeAppearanceProvider';

type AppliedStyle = { revision: number; treeIndices: IndexSet; style: NodeAppearance };

export class NodeAppearanceTextureBuilder {
  private _defaultAppearance: NodeAppearance = {};
  private readonly _styleProvider: NodeAppearanceProvider;
  private readonly _handleStylesChangedListener = this.handleStylesChanged.bind(this);

  private _needsUpdate = true;
  private readonly _treeIndexCount: number;
  private readonly _overrideColorPerTreeIndexTexture: THREE.DataTexture;
  private readonly _regularNodesTreeIndices: IndexSet;
  private readonly _ghostedNodesTreeIndices: IndexSet;
  private readonly _infrontNodesTreeIndices: IndexSet;
  private readonly _currentlyAppliedStyles = new Map<number, AppliedStyle>();

  constructor(treeIndexCount: number, styleProvider: NodeAppearanceProvider) {
    this._treeIndexCount = treeIndexCount;
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
    if (!equalNodeAppearances(appearance, this._defaultAppearance)) {
      this._defaultAppearance = appearance;
      fillColorTexture(this._overrideColorPerTreeIndexTexture, appearance);
      this._infrontNodesTreeIndices.clear();
      this._ghostedNodesTreeIndices.clear();
      this._regularNodesTreeIndices.clear();

      const allIndicesRange = new NumericRange(0, this._treeIndexCount);
      const infront = !!appearance.renderInFront;
      const ghosted = !!appearance.renderGhosted;
      if (infront) {
        this._infrontNodesTreeIndices.addRange(allIndicesRange);
      } else if (ghosted) {
        this._ghostedNodesTreeIndices.addRange(allIndicesRange);
      } else {
        this._regularNodesTreeIndices.addRange(allIndicesRange);
      }

      // Force full update as we might have overwritten previously applied styles
      this._currentlyAppliedStyles.clear();
      this._needsUpdate = true;
    }
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
    const orphanStyleIds = new Set<number>(this._currentlyAppliedStyles.keys());
    // TODO 2021-02-04 larsmoa: Currently transform overrides are never removed

    // 1. Reset nodes that has been removed from nodesets to default style
    this._styleProvider.applyStyles((styleId, revision, treeIndices) => {
      orphanStyleIds.delete(styleId);

      const currentlyApplied = this._currentlyAppliedStyles.get(styleId);
      if (currentlyApplied === undefined || currentlyApplied.revision === revision) {
        // Unchanged - nothing to do
        return;
      }

      const removedTreeIndices = currentlyApplied.treeIndices.clone().differenceWith(treeIndices);
      this.resetToDefaultStyle(removedTreeIndices, currentlyApplied.style);
    });

    // 2. Clean up orphan styles
    for (const styleId of orphanStyleIds) {
      const currentlyApplied = this._currentlyAppliedStyles.get(styleId);
      if (currentlyApplied !== undefined) {
        this.resetToDefaultStyle(currentlyApplied.treeIndices, currentlyApplied.style);
      }
      this._currentlyAppliedStyles.delete(styleId);
    }

    // 2. Apply new style to all nodes that has been added to node sets
    // Note! This is done in separate stages to support nodes moving from one set to another
    this._styleProvider.applyStyles((styleId, revision, treeIndices, appearance) => {
      const currentlyApplied = this._currentlyAppliedStyles.get(styleId);
      if (currentlyApplied !== undefined && currentlyApplied.revision === revision) {
        // Unchanged - nothing to do
        return;
      }

      // Translate from style to magic values in textures
      const fullStyle = { ...this._defaultAppearance, ...appearance };
      const addedTreeIndices =
        currentlyApplied === undefined ? treeIndices : treeIndices.clone().differenceWith(currentlyApplied.treeIndices);
      this._currentlyAppliedStyles.set(styleId, { revision, treeIndices: treeIndices.clone(), style: fullStyle });

      this.applyStyleToNodes(addedTreeIndices, fullStyle);
    });

    this._needsUpdate = false;
  }

  private resetToDefaultStyle(treeIndices: IndexSet, currentStyle: NodeAppearance) {
    if (treeIndices.count === 0) {
      return;
    }

    const defaultColorRgba = appearanceToColorOverride(this._defaultAppearance);

    const infront = !!currentStyle.renderInFront;
    const ghosted = !infront && !!currentStyle.renderGhosted;

    applyRGBA(this._overrideColorPerTreeIndexTexture, treeIndices, defaultColorRgba);

    if (infront) {
      updateLookupSet(this._infrontNodesTreeIndices, treeIndices, false);
    } else if (ghosted) {
      updateLookupSet(this._ghostedNodesTreeIndices, treeIndices, false);
    }
    if (infront || ghosted) {
      updateLookupSet(this._regularNodesTreeIndices, treeIndices, true);
    }
  }

  private applyStyleToNodes(treeIndices: IndexSet, style: NodeAppearance) {
    if (treeIndices.count === 0) {
      return;
    }

    const colorRgba = appearanceToColorOverride(style);
    applyRGBA(this._overrideColorPerTreeIndexTexture, treeIndices, colorRgba);

    const infront = !!style.renderInFront;
    const ghosted = !infront && !!style.renderGhosted;

    updateLookupSet(this._infrontNodesTreeIndices, treeIndices, infront);
    updateLookupSet(this._ghostedNodesTreeIndices, treeIndices, ghosted);
    updateLookupSet(this._regularNodesTreeIndices, treeIndices, !infront && !ghosted);
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

function fillColorTexture(colorTexture: THREE.DataTexture, appearance: NodeAppearance) {
  const colorRgba = appearanceToColorOverride(appearance);
  const colors = colorTexture.image.data;
  const textureElementCount = colorTexture.image.width * colorTexture.image.height;
  for (let i = 0; i < textureElementCount; ++i) {
    colors[4 * i + 0] = colorRgba[0];
    colors[4 * i + 1] = colorRgba[1];
    colors[4 * i + 2] = colorRgba[2];
    colors[4 * i + 3] = colorRgba[3];
  }
  colorTexture.needsUpdate = true;
}

function appearanceToColorOverride(appearance: NodeAppearance): [number, number, number, number] {
  const [r, g, b] = appearance.color || [0, 0, 0];
  const isVisible = appearance.visible !== undefined ? !!appearance.visible : true;
  const inFront = !!appearance.renderInFront;
  const ghosted = !!appearance.renderGhosted;
  const outlineColor = appearance.outlineColor ? Number(appearance.outlineColor) : 0;
  // Byte layout:
  // [isVisible, renderInFront, renderGhosted, outlineColor0, outlineColor1, outlineColor2, unused, unused]
  const bytePattern = (isVisible ? 1 << 0 : 0) + (inFront ? 1 << 1 : 0) + (ghosted ? 1 << 2 : 0) + (outlineColor << 3);

  return [r, g, b, bytePattern];
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

function updateLookupSet(set: IndexSet, treeIndices: IndexSet, addToSet: boolean) {
  if (addToSet) {
    set.unionWith(treeIndices);
  } else {
    set.differenceWith(treeIndices);
  }
}

function equalNodeAppearances(left: NodeAppearance, right: NodeAppearance) {
  // https://stackoverflow.com/a/1144249/167251
  return JSON.stringify(left) === JSON.stringify(right);
}
