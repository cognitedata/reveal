import { BufferGeometry, Float32BufferAttribute, Uint32BufferAttribute, type Vector3 } from 'three';

export class TrianglesBuffers {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  protected positions: Float32Array;
  protected normals: Float32Array | undefined = undefined;
  protected uvs: Float32Array | undefined = undefined;
  protected triangleIndexes: number[] = [];
  protected uniqueIndex = 0;

  public get isFilled(): boolean {
    return this.uniqueIndex === this.positions.length / 3;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(pointCount: number, makeNormals = true, makeUvs = false) {
    this.positions = new Float32Array(3 * pointCount);
    if (makeNormals) {
      this.normals = new Float32Array(3 * pointCount);
    }
    if (makeUvs) {
      this.uvs = new Float32Array(2 * pointCount);
    }
  }

  // ==================================================
  // INSTANCE METHODS: Creators
  // ==================================================

  public createBufferGeometry(): BufferGeometry {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(this.positions, 3, true));
    if (this.normals !== undefined) {
      geometry.setAttribute('normal', new Float32BufferAttribute(this.normals, 3, false)); // Auto normalizing
    }
    geometry.setIndex(new Uint32BufferAttribute(this.triangleIndexes, 1, true));
    if (this.uvs !== undefined) {
      geometry.setAttribute('uv', new Float32BufferAttribute(this.uvs, 2, true));
    }
    return geometry;
  }

  // ==================================================
  // INSTANCE METHODS: Add to triangle strip
  // ==================================================

  public addPairWithNormals(p1: Vector3, p2: Vector3, n1: Vector3, n2: Vector3, u = 0): void {
    if (this.uniqueIndex >= 2) {
      //     2------3
      //     |      |
      //     0------1
      const unique0 = this.uniqueIndex - 2;
      const unique1 = this.uniqueIndex - 1;
      const unique2 = this.uniqueIndex;
      const unique3 = this.uniqueIndex + 1;

      this.addTriangle(unique0, unique3, unique2);
      this.addTriangle(unique0, unique1, unique3);
    }
    this.add(p1, n1, u);
    this.add(p2, n2, u);
  }

  public addPairWithNormal(p1: Vector3, p2: Vector3, normal: Vector3, u: number = 0): void {
    this.addPairWithNormals(p1, p2, normal, normal, u);
  }

  public addTriangle(index0: number, index1: number, index2: number): void {
    this.triangleIndexes.push(index0, index1, index2);
  }

  public add(position: Vector3, normal: Vector3, u = 0, v = 0): void {
    this.setAt(this.uniqueIndex, position, normal, u, v);
    this.uniqueIndex++;
  }

  public addPosition(position: Vector3): void {
    this.setPositionAt(this.uniqueIndex, position);
    this.uniqueIndex++;
  }

  // ==================================================
  // INSTANCE METHODS: Set at position
  // ==================================================

  public setAt(index: number, position: Vector3, normal: Vector3, u = 0, v = 0): void {
    this.setPositionAt(index, position);
    this.setNormalAt(index, normal);
    this.setUvAt(index, u, v);
  }

  private setPositionAt(index: number, position: Vector3): void {
    const i = 3 * index;
    this.positions[i + 0] = position.x;
    this.positions[i + 1] = position.y;
    this.positions[i + 2] = position.z;
  }

  private setNormalAt(index: number, normal: Vector3): void {
    if (this.normals === undefined) {
      return;
    }
    const i = 3 * index;
    this.normals[i + 0] = normal.x;
    this.normals[i + 1] = normal.y;
    this.normals[i + 2] = normal.z;
  }

  private setUvAt(index: number, u = 0, v = 0): void {
    if (this.uvs === undefined) {
      return;
    }
    const i = 2 * index;
    this.uvs[i + 0] = u;
    this.uvs[i + 1] = v;
  }
}
