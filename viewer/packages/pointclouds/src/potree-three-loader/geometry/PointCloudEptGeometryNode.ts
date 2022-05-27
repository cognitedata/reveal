/*
 * Adapted from Potree:
 * https://github.com/potree/potree/blob/develop/src/PointCloudEptGeometry.js
 * License in LICENSE.potree
 */

import { IPointCloudTreeGeometryNode } from './IPointCloudTreeGeometryNode';
import { IPointCloudTreeNodeBase } from '../tree/IPointCloudTreeNodeBase';
import * as THREE from 'three';
import { PointCloudEptGeometry, EptKey } from './PointCloudEptGeometry';
import { sphereFrom } from './translationUtils';

import {
  globalNumNodesLoading,
  globalMaxNumNodesLoading,
  incrementGlobalNumNodesLoading,
  decrementGlobalNumNodesLoading
} from '../loading/globalLoadingCounter';
import { ModelDataProvider } from '@reveal/modeldata-api';

export class PointCloudEptGeometryNode implements IPointCloudTreeGeometryNode {
  private readonly _id: number;
  private readonly _ept: PointCloudEptGeometry;
  private readonly _key: EptKey;

  private readonly _dataLoader: ModelDataProvider;

  private readonly _boundingBox: THREE.Box3;

  private readonly _boundingSphere: THREE.Sphere;
  private readonly _spacing: number;
  private _level: number;
  private _numPoints: number;

  private readonly _name: string;
  private readonly _index: number;

  private readonly _children: IPointCloudTreeGeometryNode[] = new Array(8);

  private _loading: boolean;
  private _loaded: boolean;
  private _parent: PointCloudEptGeometryNode | undefined = undefined;

  private _isLeafNode: boolean;

  private _geometry: THREE.BufferGeometry | undefined;

  private _oneTimeDisposeHandlers: (() => void)[];

  static IDCount: number = 0;

  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get level(): number {
    return this._level;
  }

  get spacing(): number {
    return this._spacing;
  }

  get boundingBox(): THREE.Box3 {
    return this._boundingBox;
  }

  get boundingSphere(): THREE.Sphere {
    return this._boundingSphere;
  }

  get loaded(): boolean {
    return this._loaded;
  }

  get key(): EptKey {
    return this._key;
  }

  get failed(): boolean {
    // We are currently missing proper error handling
    return false;
  }

  get numPoints(): number {
    return this._numPoints;
  }

  get children(): IPointCloudTreeNodeBase[] {
    return this._children;
  }

  get oneTimeDisposeHandlers(): (() => void)[] {
    return this._oneTimeDisposeHandlers;
  }

  get isLeafNode(): boolean {
    return this._isLeafNode;
  }

  get geometry(): THREE.BufferGeometry | undefined {
    return this._geometry!;
  }

  get ept(): PointCloudEptGeometry {
    return this._ept;
  }

  get index(): number {
    return this._index;
  }

  set parent(_p: PointCloudEptGeometryNode | undefined) {
    this._parent = _p;
  }

  get parent(): PointCloudEptGeometryNode | undefined {
    return this._parent;
  }

  constructor(
    ept: PointCloudEptGeometry,
    modelDataProvider: ModelDataProvider,
    b?: THREE.Box3,
    d?: number,
    x?: number,
    y?: number,
    z?: number
  ) {
    this._ept = ept;
    this._key = new EptKey(this._ept, b || this._ept.boundingBox, d || 0, x, y, z);

    this._dataLoader = modelDataProvider;

    this._isLeafNode = false;

    this._id = PointCloudEptGeometryNode.IDCount++;
    this._geometry = undefined;
    this._boundingBox = this._key.b;
    this._spacing = this._ept.spacing / Math.pow(2, this._key.d);
    this._boundingSphere = sphereFrom(this._boundingBox);

    this._numPoints = -1;

    this._level = this._key.d;
    this._loaded = false;
    this._loading = false;
    this._oneTimeDisposeHandlers = [];

    const k = this._key;
    this._name = this.toPotreeName(k.d, k.x, k.y, k.z);
    this._index = parseInt(this._name.charAt(this._name.length - 1));
  }

  get isGeometryNode(): boolean {
    return true;
  }

  getLevel(): number {
    return this._level;
  }

  get isTreeNode(): boolean {
    return false;
  }

  isLoaded(): boolean {
    return this._loaded;
  }

  getBoundingSphere(): THREE.Sphere {
    return this._boundingSphere;
  }

  getBoundingBox(): THREE.Box3 {
    return this._boundingBox;
  }

  baseUrl(): string {
    return this._ept.url + 'ept-data';
  }

  getNumPoints(): number {
    return this._numPoints;
  }

  fileName(): string {
    return this._key.name();
  }

  getChildren(): IPointCloudTreeGeometryNode[] {
    const children = [];

    for (let i = 0; i < 8; i++) {
      if (this._children[i]) {
        children.push(this._children[i]);
      }
    }

    return children;
  }

  traverse(callback: (node: IPointCloudTreeNodeBase) => void, includeSelf: boolean = true): void {
    const stack: IPointCloudTreeNodeBase[] = includeSelf ? [this] : [];

    let current: IPointCloudTreeNodeBase | undefined;
    while ((current = stack.pop())) {
      callback(current);

      for (const child of current.children) {
        if (child) {
          stack.push(child);
        }
      }
    }
  }

  addChild(child: PointCloudEptGeometryNode): void {
    this._children[child.index] = child;
    child.parent = this;
  }

  async load(): Promise<void> {
    if (this._loaded || this._loading) return;
    if (globalNumNodesLoading >= globalMaxNumNodesLoading) return;

    this._loading = true;
    incrementGlobalNumNodesLoading();

    if (this._numPoints == -1) await this.loadHierarchy();

    await this.loadPoints();
    return Promise.resolve();
  }

  async loadPoints(): Promise<void> {
    return this._ept.loader.load(this);
  }

  async loadHierarchy(): Promise<void> {
    const nodes: { [key: string]: PointCloudEptGeometryNode } = {};
    nodes[this.fileName()] = this;

    const baseUrl = `${this.ept.url}ept-hierarchy`;
    const fileName = `${this.fileName()}.json`;

    const hier = await this._dataLoader.getJsonFile(baseUrl, fileName);

    // Since we want to traverse top-down, and 10 comes
    // lexicographically before 9 (for example), do a deep sort.
    const keys = Object.keys(hier).sort((a, b) => {
      const [da, xa, ya, za] = a.split('-').map(n => parseInt(n, 10));
      const [db, xb, yb, zb] = b.split('-').map(n => parseInt(n, 10));
      if (da < db) return -1;
      if (da > db) return 1;
      if (xa < xb) return -1;
      if (xa > xb) return 1;
      if (ya < yb) return -1;
      if (ya > yb) return 1;
      if (za < zb) return -1;
      if (za > zb) return 1;
      return 0;
    });

    keys.forEach(v => {
      const [d, x, y, z] = v.split('-').map(n => parseInt(n, 10));
      const a = x & 1,
        b = y & 1,
        c = z & 1;
      const parentName = d - 1 + '-' + (x >> 1) + '-' + (y >> 1) + '-' + (z >> 1);

      const parentNode = nodes[parentName];
      if (!parentNode) return;

      const key = parentNode.key.step(a, b, c);

      const node = new PointCloudEptGeometryNode(this.ept, this._dataLoader, key.b, key.d, key.x, key.y, key.z);

      node._level = d;
      node._numPoints = hier[v];

      parentNode.addChild(node);
      nodes[key.name()] = node;
    });
  }

  doneLoading(
    bufferGeometry: THREE.BufferGeometry,
    _tightBoundingBox: THREE.Box3,
    np: number,
    _mean: THREE.Vector3
  ): void {
    bufferGeometry.boundingBox = this._boundingBox;
    this._geometry = bufferGeometry;
    this._numPoints = np;
    this._loaded = true;
    this._loading = false;
    decrementGlobalNumNodesLoading();
  }

  toPotreeName(d: number, x: number, y: number, z: number): string {
    let name = 'r';

    for (let i = 0; i < d; ++i) {
      const shift = d - i - 1;
      const mask = 1 << shift;
      let step = 0;

      if (x & mask) step += 4;
      if (y & mask) step += 2;
      if (z & mask) step += 1;

      name += step;
    }

    return name;
  }

  dispose(): void {
    if (this._geometry && this.parent != null) {
      this._geometry.dispose();
      this._geometry = undefined;
      this._loaded = false;
      this._isLeafNode = true;

      for (let i = 0; i < this._oneTimeDisposeHandlers.length; i++) {
        const handler = this._oneTimeDisposeHandlers[i];
        handler();
      }
      this._oneTimeDisposeHandlers = [];
    }
  }
}
