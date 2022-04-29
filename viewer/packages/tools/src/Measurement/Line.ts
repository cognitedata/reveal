/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { LineGeometrySegment } from './LineGeometrySegment';

export class Line extends THREE.Mesh {
  private readonly _start: THREE.Vector3;
  private readonly _end: THREE.Vector3;
  constructor(geometry: LineGeometrySegment, material: THREE.ShaderMaterial) {
    super(geometry, material);
    this._start = new THREE.Vector3();
    this._end = new THREE.Vector3();
  }

  public computeLneDistances(): void {
    const geometry = this.geometry;
    const instanceStart = geometry.attributes.instanceStart;
    const instanceEnd = geometry.attributes.instanceEnd;
    const lineDistances = new Float32Array(2 * instanceStart.count);

    for (let i = 0, j = 0, l = instanceStart.count; i < l; i++, j += 2) {
      this._start.fromBufferAttribute(instanceStart, i);

      this._end.fromBufferAttribute(instanceEnd, i);

      lineDistances[j] = j === 0 ? 0 : lineDistances[j - 1];
      lineDistances[j + 1] = lineDistances[j] + this._start.distanceTo(this._end);
    }

    const instanceDistanceBuffer = new THREE.InstancedInterleavedBuffer(lineDistances, 2, 1);

    geometry.setAttribute('instanceDistanceStart', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 0));

    geometry.setAttribute('instanceDistanceEnd', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 1));
  }
}
