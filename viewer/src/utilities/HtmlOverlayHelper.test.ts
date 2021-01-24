/*!
 * Copyright 2021 Cognite AS
 */

import { HtmlOverlayHelper, HtmlOverlayOptions } from './HtmlOverlayHelper';
import * as THREE from 'three';

describe('HtmlOverlayHelper', () => {
  const canvasContainer = document.createElement('div');
  const renderer: THREE.WebGLRenderer = {
    domElement: document.createElement('canvas'),
    getPixelRatio: () => 1
  } as any;
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(0, 0, 0);
  camera.near = 0.1;
  camera.far = 1.0;
  camera.lookAt(new THREE.Vector3(0, 0, 1));
  camera.updateProjectionMatrix();
  camera.updateMatrix();

  test('addOverlayElement() only accepts absolute position', () => {
    // Arrange
    const helper = new HtmlOverlayHelper(canvasContainer);
    const htmlElement = document.createElement('div');
    htmlElement.className = 'overlay';
    htmlElement.style.position = 'relative';
    const position = new THREE.Vector3();

    // Act & Assert
    expect(() => helper.addOverlayElement(htmlElement, position)).toThrowError();
  });

  test('updatePositions() places overlays correctly', () => {
    // Arrange
    const helper = new HtmlOverlayHelper(canvasContainer);
    const htmlElement = document.createElement('div');
    htmlElement.style.position = 'absolute';
    expect(htmlElement.style.top).toBeEmpty();
    expect(htmlElement.style.left).toBeEmpty();
    const position = new THREE.Vector3(0, 0, 0.5);
    helper.addOverlayElement(htmlElement, position);

    // Act
    helper.updatePositions(renderer, camera);

    // Assert
    expect(htmlElement.style.visibility).toBe('visible');
    expect(htmlElement.style.top).toBe(`${renderer.domElement.height / 2}px`);
    expect(htmlElement.style.left).toBe(`${renderer.domElement.width / 2}px`);
  });

  test('updatePositions() hides overlay if behind camera or behind far plane', () => {
    // Arrange
    const helper = new HtmlOverlayHelper(canvasContainer);
    const behindCameraElement = document.createElement('div');
    behindCameraElement.style.position = 'absolute';
    const behindFarPlaneElement = document.createElement('div');
    behindFarPlaneElement.style.position = 'absolute';
    helper.addOverlayElement(behindCameraElement, new THREE.Vector3(0, 0, -1));
    helper.addOverlayElement(behindFarPlaneElement, new THREE.Vector3(0, 0, 10));

    // Act
    helper.updatePositions(renderer, camera);

    // Assert
    expect(behindCameraElement.style.visibility).toBe('hidden');
    expect(behindFarPlaneElement.style.visibility).toBe('hidden');
  });

  test('updatePositions() triggers position update callback', () => {
    // Arrange
    const helper = new HtmlOverlayHelper(canvasContainer);
    const behindCameraElement = document.createElement('div');
    behindCameraElement.style.position = 'absolute';
    const behindFarPlaneElement = document.createElement('div');
    behindFarPlaneElement.style.position = 'absolute';
    const withinNearAndFarPlaneElement = document.createElement('div');
    withinNearAndFarPlaneElement.style.position = 'absolute';
    const options: HtmlOverlayOptions = { positionUpdatedCallback: jest.fn() };
    helper.addOverlayElement(behindCameraElement, new THREE.Vector3(0, 0, -1), options);
    helper.addOverlayElement(behindFarPlaneElement, new THREE.Vector3(0, 0, 10), options);
    helper.addOverlayElement(withinNearAndFarPlaneElement, new THREE.Vector3(0, 0, 0.5), options);

    // Act
    helper.updatePositions(renderer, camera);

    // Assert
    expect(options.positionUpdatedCallback).toHaveBeenCalledWith(
      behindCameraElement,
      expect.any(THREE.Vector2),
      expect.any(THREE.Vector3),
      expect.anything()
    );
    expect(options.positionUpdatedCallback).toHaveBeenCalledWith(
      behindFarPlaneElement,
      expect.any(THREE.Vector2),
      expect.any(THREE.Vector3),
      expect.anything()
    );
    expect(options.positionUpdatedCallback).toHaveBeenCalledWith(
      withinNearAndFarPlaneElement,
      expect.any(THREE.Vector2),
      expect.any(THREE.Vector3),
      expect.anything()
    );
  });
});
