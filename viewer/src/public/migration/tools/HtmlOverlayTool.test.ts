/*!
 * Copyright 2021 Cognite AS
 */

import { HtmlOverlayTool, HtmlOverlayOptions } from './HtmlOverlayTool';
import * as THREE from 'three';

describe('HtmlOverlayTool', () => {
  let canvasContainer: HTMLElement;
  let renderer: THREE.WebGLRenderer;
  let camera: THREE.PerspectiveCamera;

  beforeEach(() => {
    canvasContainer = document.createElement('div');

    renderer = {
      domElement: document.createElement('canvas'),
      getPixelRatio: () => 1
    } as any;

    camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 0, 0);
    camera.near = 0.1;
    camera.far = 1.0;
    camera.lookAt(new THREE.Vector3(0, 0, 1));
    camera.updateProjectionMatrix();
    camera.updateMatrix();
  });

  test('add() only accepts absolute position', () => {
    // Arrange
    const helper = new HtmlOverlayTool(canvasContainer, renderer, camera);
    const htmlElement = document.createElement('div');
    htmlElement.className = 'overlay';
    htmlElement.style.position = 'relative';
    const position = new THREE.Vector3();

    // Act & Assert
    expect(() => helper.add(htmlElement, position)).toThrowError();
  });

  test('notifyRendered() places overlays correctly', () => {
    // Arrange
    const helper = new HtmlOverlayTool(canvasContainer, renderer, camera);
    const htmlElement = document.createElement('div');
    htmlElement.style.position = 'absolute';
    expect(htmlElement.style.top).toBeEmpty();
    expect(htmlElement.style.left).toBeEmpty();
    const position = new THREE.Vector3(0, 0, 0.5);
    helper.add(htmlElement, position);

    // Act
    helper.notifyRendered();

    // Assert
    expect(htmlElement.style.visibility).toBe('visible');
    expect(htmlElement.style.top).toBe(`${renderer.domElement.height / 2}px`);
    expect(htmlElement.style.left).toBe(`${renderer.domElement.width / 2}px`);
  });

  test('notifyRendered() hides overlay if behind camera or behind far plane', () => {
    // Arrange
    const helper = new HtmlOverlayTool(canvasContainer, renderer, camera);
    const behindCameraElement = document.createElement('div');
    behindCameraElement.style.position = 'absolute';
    const behindFarPlaneElement = document.createElement('div');
    behindFarPlaneElement.style.position = 'absolute';
    helper.add(behindCameraElement, new THREE.Vector3(0, 0, -1));
    helper.add(behindFarPlaneElement, new THREE.Vector3(0, 0, 10));

    // Act
    helper.notifyRendered();

    // Assert
    expect(behindCameraElement.style.visibility).toBe('hidden');
    expect(behindFarPlaneElement.style.visibility).toBe('hidden');
  });

  test('notifyRendered() triggers position update callback', () => {
    // Arrange
    const helper = new HtmlOverlayTool(canvasContainer, renderer, camera);
    const behindCameraElement = document.createElement('div');
    behindCameraElement.style.position = 'absolute';
    const behindFarPlaneElement = document.createElement('div');
    behindFarPlaneElement.style.position = 'absolute';
    const withinNearAndFarPlaneElement = document.createElement('div');
    withinNearAndFarPlaneElement.style.position = 'absolute';
    const options: HtmlOverlayOptions = { positionUpdatedCallback: jest.fn() };
    helper.add(behindCameraElement, new THREE.Vector3(0, 0, -1), options);
    helper.add(behindFarPlaneElement, new THREE.Vector3(0, 0, 10), options);
    helper.add(withinNearAndFarPlaneElement, new THREE.Vector3(0, 0, 0.5), options);

    // Act
    helper.notifyRendered();

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

  test('dispose() removes all overlays', () => {
    // Arrange
    const helper = new HtmlOverlayTool(canvasContainer, renderer, camera);
    for (let i = 0; i < 10; i++) {
      const element = document.createElement('div');
      element.style.position = 'absolute';
      helper.add(element, new THREE.Vector3(0, 0, 0));
    }
    expect(canvasContainer.children.length).toBe(10);

    // Act
    helper.dispose();

    // Assert
    expect(canvasContainer.children.length).toBe(0);
  });
});
