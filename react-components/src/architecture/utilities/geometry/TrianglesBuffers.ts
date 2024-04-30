/*!
 * Copyright 2024 Cognite AS
 */
import {
  BufferGeometry,
  Float32BufferAttribute,
  FrontSide,
  Uint32BufferAttribute,
  type Vector3
} from 'three';

export class TrianglesBuffers {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public side = FrontSide;
  protected positions: Float32Array;
  protected normals: Float32Array;
  protected uvs: Float32Array;
  protected triangleIndexes: number[] = [];
  protected uniqueIndex = 0;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get hasUvs(): boolean {
    return this.uvs.length > 0;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(pointCount: number, makeUvs = false) {
    this.positions = new Float32Array(3 * pointCount);
    this.normals = new Float32Array(3 * pointCount);
    this.uvs = new Float32Array(makeUvs ? 2 * pointCount : 0);
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  public createBufferGeometry(): BufferGeometry {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(this.positions, 3, true));
    geometry.setAttribute('normal', new Float32BufferAttribute(this.normals, 3, false)); // Auto normalizing
    geometry.setIndex(new Uint32BufferAttribute(this.triangleIndexes, 1, true));
    if (this.hasUvs) {
      geometry.setAttribute('uv', new Float32BufferAttribute(this.uvs, 2, true));
    }
    return geometry;
  }

  // ==================================================
  // INSTANCE METHODS: Operations
  // ==================================================

  public addPair(p1: Vector3, p2: Vector3, n1: Vector3, n2: Vector3, u = 0): void {
    if (this.uniqueIndex >= 2) {
      //     2------3
      //     |      |
      //     0------1
      const unique0 = this.uniqueIndex - 2;
      const unique1 = this.uniqueIndex - 1;
      const unique2 = this.uniqueIndex;
      const unique3 = this.uniqueIndex + 1;

      this.addTriangle(unique0, unique2, unique3);
      this.addTriangle(unique0, unique3, unique1);
    }

    this.add(p1, n1, u);
    this.add(p2, n2, u);
  }

  public addPair2(p1: Vector3, p2: Vector3, normal: Vector3, u: number): void {
    if (this.uniqueIndex >= 2) {
      //     2------3
      //     |      |
      //     0------1
      const unique0 = this.uniqueIndex - 2;
      const unique1 = this.uniqueIndex - 1;
      const unique2 = this.uniqueIndex;
      const unique3 = this.uniqueIndex + 1;

      this.addTriangle(unique0, unique2, unique3);
      this.addTriangle(unique0, unique3, unique1);
    }
    if (this.hasUvs) {
      this.add(p1, normal, u);
      this.add(p2, normal, u);
    }
  }

  protected add(position: Vector3, normal: Vector3, u = 0, v = 0): void {
    this.setAt(this.uniqueIndex, position, normal, u, v);
    this.uniqueIndex++;
  }

  protected setAt(uniqueIndex: number, position: Vector3, normal: Vector3, u = 0, v = 0): void {
    {
      const index = 3 * uniqueIndex;
      this.positions[index + 0] = position.x;
      this.positions[index + 1] = position.y;
      this.positions[index + 2] = position.z;
      this.normals[index + 0] = normal.x;
      this.normals[index + 1] = normal.y;
      this.normals[index + 2] = normal.z;
    }
    if (this.hasUvs) {
      const index = 2 * uniqueIndex;
      this.uvs[index + 0] = u;
      this.uvs[index + 1] = v;
    }
  }

  protected addTriangle(index0: number, index1: number, index2: number): void {
    this.triangleIndexes.push(index0, index1, index2);
  }
}
