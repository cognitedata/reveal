/*
 * Original file: https://github.com/potree/potree/blob/develop/src/PointCloudEptGeometry.js
 *
 * Translation to typescript + other minor changes by Håkon Flatval, Cognite AS, March 2022
 */

import * as THREE from 'three';

import { ILoader } from './loading/ept/ILoader';
import { EptBinaryLoader } from './loading/ept/BinaryLoader';

import { PointCloudEptGeometryNode } from './PointCloudEptGeometryNode';
import { IPointCloudTreeGeometry } from './IPointCloudTreeGeometry';

import proj4 from 'proj4';

type SchemaEntry = {
  name: string;
  scale: number;
  offset: number;
};

export class Utils {
  static toVector3(v: number[], offset?: number): THREE.Vector3 {
    return new THREE.Vector3().fromArray(v, offset || 0);
  }

  static toBox3(b: number[]): THREE.Box3 {
    return new THREE.Box3(Utils.toVector3(b), Utils.toVector3(b, 3));
  };

  static findDim(schema: SchemaEntry[], name: string) {
    let dim = schema.find((dim) => dim.name == name);
    if (!dim) throw new Error('Failed to find ' + name + ' in schema');
    return dim;
  }

  static sphereFrom(b: THREE.Box3) {
    return b.getBoundingSphere(new THREE.Sphere());
  }
};

export class PointCloudEptGeometry implements IPointCloudTreeGeometry {

  private readonly _eptScale: THREE.Vector3;
  private readonly _eptOffset: THREE.Vector3;

  private readonly _url: string;

  private readonly _boundingBox: THREE.Box3;
  private readonly _tightBoundingBox: THREE.Box3;

  private readonly _offset: THREE.Vector3;

  private readonly _span: number;
  private readonly _spacing: number;

  private readonly _loader: ILoader;

  private readonly _schema: SchemaEntry[];

  private _root: PointCloudEptGeometryNode | undefined;

  private _projection: string | null;

  get root(): PointCloudEptGeometryNode | undefined {
    return this._root;
  }

  get boundingBox(): THREE.Box3 {
    return this._boundingBox;
  }

  get tightBoundingBox(): THREE.Box3 {
    return this._tightBoundingBox;
  }

  get offset(): THREE.Vector3 {
    return this._offset;
  }

  get spacing(): number {
    return this._spacing;
  }

  get url(): string {
    return this._url;
  }

  get schema(): SchemaEntry[] {
    return this._schema;
  }

  get eptScale(): THREE.Vector3 {
    return this._eptScale;
  }

  get eptOffset(): THREE.Vector3 {
    return this._eptOffset;
  }

  get loader(): ILoader {
    return this._loader;
  }

  set root(r: PointCloudEptGeometryNode | undefined) {
    this._root = r;
  }

  constructor(url: string, info: any) {
    const schema = info.schema;
    const bounds = info.bounds;
    const boundsConforming = info.boundsConforming;

    let xyz = [
      Utils.findDim(schema, 'X'),
      Utils.findDim(schema, 'Y'),
      Utils.findDim(schema, 'Z')
    ];
    let scale = xyz.map((d) => d.scale || 1);
    let offset = xyz.map((d) => d.offset || 0);
    this._eptScale = Utils.toVector3(scale);
    this._eptOffset = Utils.toVector3(offset);

    this._url = url;

    this._schema = schema;
    this._span = info.span || info.ticks;
    this._boundingBox = Utils.toBox3(bounds);
    this._tightBoundingBox = Utils.toBox3(boundsConforming);
    this._offset = Utils.toVector3([0, 0, 0]);

    this._projection = null;

    if (info.srs && info.srs.horizontal) {
      this._projection = info.srs.authority + ':' + info.srs.horizontal;
    }

    if (info.srs.wkt) {
      if (!this._projection) this._projection = info.srs.wkt;
    }

    if (this._projection)
    {
      // TODO [mschuetz]: named projections that proj4 can't handle seem to cause problems.
      // remove them for now

      try {
        proj4(this._projection);
      } catch (e) {
        this._projection = null;
      }
    }

    this._spacing =
      (this._boundingBox.max.x - this._boundingBox.min.x) / this._span;

    if (info.dataType !== 'binary') {
      throw new Error('Could not read data type: ' + info.dataType);
    }

    this._loader = new EptBinaryLoader();
  }

  dispose() { }
};

export class EptKey {

  readonly ept: PointCloudEptGeometry;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly b: THREE.Box3;
  readonly d: number;

  constructor(ept: PointCloudEptGeometry,
    b: THREE.Box3,
    d: number,
    x?: number,
    y?: number,
    z?: number) {
    this.ept = ept;
    this.b = b;
    this.d = d;
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  name() {
    return this.d + '-' + this.x + '-' + this.y + '-' + this.z;
  }

  step(a: number, b: number, c: number) {
    let min = this.b.min.clone();
    let max = this.b.max.clone();
    let dst = new THREE.Vector3().subVectors(max, min);

    if (a) min.x += dst.x / 2;
    else max.x -= dst.x / 2;

    if (b) min.y += dst.y / 2;
    else max.y -= dst.y / 2;

    if (c) min.z += dst.z / 2;
    else max.z -= dst.z / 2;

    return new EptKey(
      this.ept,
      new THREE.Box3(min, max),
      this.d + 1,
      this.x * 2 + a,
      this.y * 2 + b,
      this.z * 2 + c);
  }

  children() {
    var result: string[] = [];
    for (var a = 0; a < 2; ++a) {
      for (var b = 0; b < 2; ++b) {
        for (var c = 0; c < 2; ++c) {
          var add = this.step(a, b, c).name();
          if (!result.includes(add)) result = result.concat(add);
        }
      }
    }
    return result;
  }
}
