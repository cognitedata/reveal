/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

export class LineGeometrySegment extends THREE.InstancedBufferGeometry {
  private readonly _box: THREE.Box3;
  private readonly _vector: THREE.Vector3;

  constructor() {
    super();
    const positions = [-1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0];
    const uvs = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2];
    const index = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];
    this._box = new THREE.Box3();
    this._vector = new THREE.Vector3();
    this.setIndex(index);
    this.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  }

  /**
   * Set the position attribute of the Line segment
   * @param array Array of position
   */
  public setPositions(array: Float32Array): void {
    let lineSegments: ArrayLike<number>;

    if (array instanceof Float32Array) {
      lineSegments = array;
    } else if (Array.isArray(array)) {
      lineSegments = new Float32Array(array);
    }

    const instanceBuffer = new THREE.InstancedInterleavedBuffer(lineSegments, 6, 1);
    this.setAttribute('instanceStart', new THREE.InterleavedBufferAttribute(instanceBuffer, 3, 0));
    this.setAttribute('instanceEnd', new THREE.InterleavedBufferAttribute(instanceBuffer, 3, 3));

    this.computeBoundingBox();
    this.computeBoundingSphere();
  }

  /**
   * Compute the bounding box of the line
   */
  public computeBoundingBox(): void {
    if (this.boundingBox === null) {
      this.boundingBox = new THREE.Box3();
    }

    const start = this.attributes.instanceStart as THREE.BufferAttribute;
    const end = this.attributes.instanceEnd as THREE.BufferAttribute;

    if (start !== undefined && end !== undefined) {
      this.boundingBox.setFromBufferAttribute(start);

      this._box.setFromBufferAttribute(end);

      this.boundingBox.union(this._box);
    }
  }

  /**
   * Compute the line sphere bounding box
   */
  public computeBoundingSphere(): void {
    if (this.boundingSphere === null) {
      this.boundingSphere = new THREE.Sphere();
    }

    if (this.boundingBox === null) {
      this.computeBoundingBox();
    }

    const start = this.attributes.instanceStart;
    const end = this.attributes.instanceEnd;

    if (start !== undefined && end !== undefined) {
      const center = this.boundingSphere.center;
      this.boundingBox.getCenter(center);
      let maxRadiusSq = 0;

      for (let i = 0, il = start.count; i < il; i++) {
        this._vector.fromBufferAttribute(start, i);

        maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(this._vector));

        this._vector.fromBufferAttribute(end, i);

        maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(this._vector));
      }

      this.boundingSphere.radius = Math.sqrt(maxRadiusSq);

      if (isNaN(this.boundingSphere.radius)) {
        console.error(
          'LineGeometrySegment.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.',
          this
        );
      }
    }
  }
}
