/*!
 * Copyright 2021 Cognite AS
 */
import { NumericRange, IndexSet } from '@reveal/utilities';
import { AreaCollection, ClusteredAreaCollection } from './prioritized/AreaCollection';
import { NodeCollectionBase, SerializedNodeCollection } from './NodeCollectionBase';

import * as THREE from 'three';

/**
 * Node collection that holds a set of nodes defined by a set of tree indices.
 */
export class TreeIndexNodeCollection extends NodeCollectionBase {
  public static readonly classToken = 'TreeIndexNodeCollection';

  private _treeIndices: IndexSet;
  private _areaCollection: AreaCollection | undefined;

  constructor(treeIndexSet?: IndexSet);
  constructor(treeIndices?: Iterable<number>);
  constructor(treeIndexRange?: NumericRange);
  constructor(values?: IndexSet | Iterable<number> | NumericRange) {
    super(TreeIndexNodeCollection.classToken);
    if (values instanceof IndexSet) {
      this._treeIndices = values;
    } else if (values instanceof NumericRange) {
      this._treeIndices = new IndexSet(values);
    } else {
      this._treeIndices = new IndexSet(values);
    }
  }

  updateSet(treeIndices: IndexSet) {
    this._treeIndices = treeIndices;
    this.notifyChanged();
  }

  /**
   * Sets this set to hold an empty set.
   */
  clear() {
    this._treeIndices = new IndexSet();
    this.notifyChanged();
  }

  getIndexSet(): IndexSet {
    return this._treeIndices;
  }

  getAreas(): AreaCollection {
    if (!this._areaCollection) {
      throw new Error(`The AreaCollection returned by getAreas() for ThreeIndexNodeCollection must be constructed manually using addAreas() and addAreaPoints() or created through initializeAreaCollection()`);
    }

    return this._areaCollection;
  }

  initializeAreaCollection(): void {
    this._areaCollection = new ClusteredAreaCollection();
  }

  addAreas(areas: THREE.Box3[]): void {
    if (!this._areaCollection) {
      this._areaCollection = new ClusteredAreaCollection();
    }

    this._areaCollection.addAreas(areas);
  }

  addAreaPoints(points: THREE.Vector3[]): void {
    if (!this._areaCollection) {
      this._areaCollection = new ClusteredAreaCollection();
    }

    const areas = points.map(p => new THREE.Box3().setFromCenterAndSize(p, new THREE.Vector3(1, 1, 1)));
    
    this._areaCollection.addAreas(areas);
  }

  clearAreas(): void {
    this._areaCollection = undefined;
  }

  get isLoading(): boolean {
    return false;
  }

  serialize(): SerializedNodeCollection {
    return {
      token: this.classToken,
      state: this._treeIndices.toRangeArray()
    };
  }
}
