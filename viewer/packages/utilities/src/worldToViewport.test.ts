/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { worldToNormalizedViewportCoordinates, worldToViewportCoordinates } from './worldToViewport';

import { jest } from '@jest/globals';
import { Mock } from 'moq.ts';
import { populateWebGLRendererMock } from '../../../test-utilities';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeInRange(min: number, max: number): R;
    }
  }
}

expect.extend({
  toBeInRange(received: number, min: number, max: number) {
    if (received >= min && received <= max) {
      return {
        message: () => `expected value not to be in range [${min}, ${max}], but was ${received}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected value to be in range [${min}, ${max}], but was ${received}`,
        pass: false
      };
    }
  }
});

describe('worldToViewport', () => {
  let renderer: THREE.WebGLRenderer;
  let camera: THREE.PerspectiveCamera;
  let canvasRect: DOMRect;

  beforeEach(async () => {
    canvasRect = {
      width: 64,
      height: 64
    } as DOMRect;

    camera = new THREE.PerspectiveCamera();
    camera.near = 1;
    camera.far = 10;
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 5);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();

    const canvas = document.createElement('canvas');
    jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(canvasRect);

    renderer = populateWebGLRendererMock(new Mock<THREE.WebGLRenderer>(), { canvas }).object();
    renderer.setSize(64, 64);
  });

  test('coordinate outside viewport', () => {
    const p = new THREE.Vector3(100, 100, 100);
    const absolute = worldToViewportCoordinates(renderer.domElement, camera, p);
    const normalized = worldToNormalizedViewportCoordinates(camera, p);

    expect(absolute.x).not.toBeInRange(0, canvasRect.width);
    expect(absolute.y).not.toBeInRange(0, canvasRect.height);
    expect(absolute.z).not.toBeInRange(-1, 1);

    expect(normalized.x).not.toBeInRange(0, 1);
    expect(normalized.y).not.toBeInRange(0, 1);
    expect(normalized.z).not.toBeInRange(-1, 1);
  });

  test('coordinate behind far plane', () => {
    const p = new THREE.Vector3(0, 0, 11);
    const absolute = worldToViewportCoordinates(renderer.domElement, camera, p);
    const normalized = worldToNormalizedViewportCoordinates(camera, p);

    expect(absolute.x).toBeInRange(0, canvasRect.width);
    expect(absolute.y).toBeInRange(0, canvasRect.height);
    expect(absolute.z).not.toBeInRange(-1, 1);

    expect(normalized.x).toBeInRange(0, 1);
    expect(normalized.y).toBeInRange(0, 1);
    expect(normalized.z).not.toBeInRange(-1, 1);
  });

  test('coordinate in front of near plane', () => {
    const p = new THREE.Vector3(0, 0, -2);
    const absolute = worldToViewportCoordinates(renderer.domElement, camera, p);
    const normalized = worldToNormalizedViewportCoordinates(camera, p);

    expect(absolute.x).toBeInRange(0, canvasRect.width);
    expect(absolute.y).toBeInRange(0, canvasRect.height);
    expect(absolute.z).not.toBeInRange(-1, 1);

    expect(normalized.x).toBeInRange(0, 1);
    expect(normalized.y).toBeInRange(0, 1);
    expect(normalized.z).not.toBeInRange(-1, 1);
  });

  test('pixel ratio is not 1', () => {
    const p = new THREE.Vector3(0.25, 1.25, 5);

    renderer.setPixelRatio(1.0);
    const absoluteWithPixelRatio1 = worldToViewportCoordinates(renderer.domElement, camera, p, new THREE.Vector3());
    const normalizedWithPixelRatio1 = worldToNormalizedViewportCoordinates(camera, p, new THREE.Vector3());

    const pixelRatio = 2.5;
    renderer.setPixelRatio(pixelRatio);
    const scaledRenderer = renderer.getSize(new THREE.Vector2()).multiplyScalar(pixelRatio);
    renderer.setSize(scaledRenderer.x, scaledRenderer.y);
    const absoluteWithPixelRatio2 = worldToViewportCoordinates(renderer.domElement, camera, p, new THREE.Vector3());
    const normalizedWithPixelRatio2 = worldToNormalizedViewportCoordinates(camera, p, new THREE.Vector3());

    expect(absoluteWithPixelRatio2).toEqual(absoluteWithPixelRatio1);
    expect(normalizedWithPixelRatio2).toEqual(normalizedWithPixelRatio1);
  });

  test('far top-left corner of view frustum, returns top-left corner of canvas', () => {
    const p = ndcToWorld(new THREE.Vector3(-1, 1, 1), camera);
    const absolute = worldToViewportCoordinates(renderer.domElement, camera, p);
    const normalized = worldToNormalizedViewportCoordinates(camera, p);

    expect(absolute.x).toBeCloseTo(0.0);
    expect(absolute.y).toBeCloseTo(0.0);
    expect(absolute.z).toBeCloseTo(1.0);

    expect(normalized.x).toBeCloseTo(0.0);
    expect(normalized.y).toBeCloseTo(0.0);
    expect(normalized.z).toBeCloseTo(1.0);
  });

  test('near top-left corner of view frustum, returns top-left corner of canvas', () => {
    const p = ndcToWorld(new THREE.Vector3(-1, 1, -1), camera);
    const absolute = worldToViewportCoordinates(renderer.domElement, camera, p);
    const normalized = worldToNormalizedViewportCoordinates(camera, p);

    expect(absolute.x).toBeCloseTo(0.0);
    expect(absolute.y).toBeCloseTo(0.0);
    expect(absolute.z).toBeCloseTo(-1.0);

    expect(normalized.x).toBeCloseTo(0.0);
    expect(normalized.y).toBeCloseTo(0.0);
    expect(normalized.z).toBeCloseTo(-1.0);
  });

  test('far bottom-right corner of view frustum, returns bottom-right corner of canvas', () => {
    const p = ndcToWorld(new THREE.Vector3(1, -1, 1), camera);
    const absolute = worldToViewportCoordinates(renderer.domElement, camera, p);
    const normalized = worldToNormalizedViewportCoordinates(camera, p);

    expect(absolute.x).toBeCloseTo(canvasRect.width);
    expect(absolute.y).toBeCloseTo(canvasRect.height);
    expect(absolute.z).toBeCloseTo(1.0);

    expect(normalized.x).toBeCloseTo(1.0);
    expect(normalized.y).toBeCloseTo(1.0);
    expect(normalized.z).toBeCloseTo(1.0);
  });

  test('near bottom-right corner of view frustum, returns bottom-right corner of canvas', () => {
    const p = ndcToWorld(new THREE.Vector3(1, -1, -1), camera);
    const absolute = worldToViewportCoordinates(renderer.domElement, camera, p);
    const normalized = worldToNormalizedViewportCoordinates(camera, p);

    expect(absolute.x).toBeCloseTo(canvasRect.width);
    expect(absolute.y).toBeCloseTo(canvasRect.height);
    expect(absolute.z).toBeCloseTo(-1.0);

    expect(normalized.x).toBeCloseTo(1.0);
    expect(normalized.y).toBeCloseTo(1.0);
    expect(normalized.z).toBeCloseTo(-1.0);
  });
});

function ndcToWorld(ndcPoint: THREE.Vector3, camera: THREE.Camera): THREE.Vector3 {
  const p = new THREE.Vector4(ndcPoint.x, ndcPoint.y, ndcPoint.z, 1.0);
  p.applyMatrix4(camera.projectionMatrixInverse);
  p.divideScalar(p.w);
  p.applyMatrix4(camera.matrixWorldInverse);
  return new THREE.Vector3(p.x, p.y, p.z);
}
