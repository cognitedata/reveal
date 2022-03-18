import { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';
import * as THREE from 'three';

import { XHRFactoryInstance } from '../utils/XHRFactory';
import { workerPool } from '../utils/WorkerPool';

import { ILoader } from './ILoader';

export class EptBinaryLoader implements ILoader {
  extension(): string {
    return '.bin';
  }

  workerPath(): string {
    return './workers/EptBinaryDecoderWorker.js';
  }

  load(node: any): void {
    if (node.loaded) return;

    const url = node.url() + this.extension();

    const xhr = XHRFactoryInstance.createXMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.overrideMimeType('text/plain; charset=x-user-defined');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const buffer = xhr.response;
          this.parse(node, buffer);
        } else {
          throw Error('Failed ' + url + ': ' + xhr.status);
        }
      }
    };

    try {
      xhr.send(null);
    } catch (e) {
      throw Error('Error loading node');
    }
  }

  parse(node: PointCloudEptGeometryNode, buffer: ArrayBuffer): void {
    const workerPath = this.workerPath();
    const worker = workerPool.getWorker(workerPath);

    worker.onmessage = function (e: any) {
      const g = new THREE.BufferGeometry();
      const numPoints = e.data.numPoints;

      const position = new Float32Array(e.data.position);
      g.setAttribute('position', new THREE.BufferAttribute(position, 3));

      const indices = new Uint8Array(e.data.indices);
      g.setAttribute('indices', new THREE.BufferAttribute(indices, 4));

      if (e.data.color) {
        const color = new Uint8Array(e.data.color);
        g.setAttribute('color', new THREE.BufferAttribute(color, 4, true));
      }
      if (e.data.intensity) {
        const intensity = new Float32Array(e.data.intensity);
        g.setAttribute('intensity', new THREE.BufferAttribute(intensity, 1));
      }
      if (e.data.classification) {
        const classification = new Uint8Array(e.data.classification);
        g.setAttribute('classification', new THREE.BufferAttribute(classification, 1));
      }
      if (e.data.returnNumber) {
        const returnNumber = new Uint8Array(e.data.returnNumber);
        g.setAttribute('return number', new THREE.BufferAttribute(returnNumber, 1));
      }
      if (e.data.numberOfReturns) {
        const numberOfReturns = new Uint8Array(e.data.numberOfReturns);
        g.setAttribute('number of returns', new THREE.BufferAttribute(numberOfReturns, 1));
      }
      if (e.data.pointSourceId) {
        const pointSourceId = new Uint16Array(e.data.pointSourceId);
        g.setAttribute('source id', new THREE.BufferAttribute(pointSourceId, 1));
      }

      g.attributes.indices.normalized = true;

      const tightBoundingBox = new THREE.Box3(
        new THREE.Vector3().fromArray(e.data.tightBoundingBox.min),
        new THREE.Vector3().fromArray(e.data.tightBoundingBox.max)
      );

      node.doneLoading(g, tightBoundingBox, numPoints, new THREE.Vector3(...e.data.mean));

      workerPool.returnWorker(workerPath, worker);
    };

    const toArray = (v: THREE.Vector3) => [v.x, v.y, v.z];
    const message = {
      buffer: buffer,
      schema: node.ept.schema,
      scale: node.ept.eptScale,
      offset: node.ept.eptOffset,
      mins: toArray(node.key.b.min)
    };

    worker.postMessage(message, [message.buffer]);
  }
}
