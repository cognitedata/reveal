/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { HtmlOverlayOptions, HtmlOverlayTool } from './HtmlOverlayTool';
import { Cognite3DViewer } from '../public/migration/Cognite3DViewer';
import { CogniteClient } from '@cognite/sdk';
import { SectorCuller } from '../internal';

describe('HtmlOverlayTool', () => {
  let canvasContainer: HTMLElement;
  let viewer: Cognite3DViewer;
  let camera: THREE.PerspectiveCamera;

  const sdk = new CogniteClient({ appId: 'cognite.reveal.unittest' });
  const context: WebGLRenderingContext = require('gl')(64, 64, { preserveDrawingBuffer: true });
  const renderer = new THREE.WebGLRenderer({ context });
  const _sectorCuller: SectorCuller = {
    determineSectors: jest.fn(),
    dispose: jest.fn()
  };

  beforeEach(() => {
    canvasContainer = document.createElement('div');
    canvasContainer.style.width = '640px';
    canvasContainer.style.height = '480px';

    camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 0, 0);
    camera.near = 0.1;
    camera.far = 1.0;
    camera.lookAt(new THREE.Vector3(0, 0, 1));
    camera.updateProjectionMatrix();
    camera.updateMatrix();

    viewer = new Cognite3DViewer({ domElement: canvasContainer, sdk, renderer, _sectorCuller });
    jest.spyOn(viewer, 'getCamera').mockReturnValue(camera);
  });

  test('add() only accepts absolute position', () => {
    // Arrange
    const helper = new HtmlOverlayTool(viewer);
    const htmlElement = document.createElement('div');
    htmlElement.className = 'overlay';
    htmlElement.style.position = 'relative';
    const position = new THREE.Vector3();

    // Act & Assert
    expect(() => helper.add(htmlElement, position)).toThrowError();
  });

  test('add() accepts position set to absolute through cssText', () => {
    // Arrange
    const helper = new HtmlOverlayTool(viewer);
    const htmlElement = document.createElement('div');
    htmlElement.style.cssText = 'position: absolute;';
    const position = new THREE.Vector3();

    // Act & Assert
    expect(() => helper.add(htmlElement, position)).not.toThrow();
  });

  test('forceUpdate() places overlays correctly', () => {
    // Arrange
    const helper = new HtmlOverlayTool(viewer);
    const htmlElement = document.createElement('div');
    htmlElement.style.position = 'absolute';
    expect(htmlElement.style.top).toBeEmpty();
    expect(htmlElement.style.left).toBeEmpty();
    const position = new THREE.Vector3(0, 0, 0.5);

    // Act
    helper.add(htmlElement, position);

    // Assert
    expect(htmlElement.style.visibility).toBe('visible');
    expect(htmlElement.style.top).toBe(`${renderer.domElement.height / 2}px`);
    expect(htmlElement.style.left).toBe(`${renderer.domElement.width / 2}px`);
  });

  test('Hides overlay if behind camera or behind far plane', () => {
    // Arrange
    const helper = new HtmlOverlayTool(viewer);
    const behindCameraElement = document.createElement('div');
    behindCameraElement.style.position = 'absolute';
    const behindFarPlaneElement = document.createElement('div');
    behindFarPlaneElement.style.position = 'absolute';

    // Act
    helper.add(behindCameraElement, new THREE.Vector3(0, 0, -1));
    helper.add(behindFarPlaneElement, new THREE.Vector3(0, 0, 10));

    // Assert
    expect(behindCameraElement.style.visibility).toBe('hidden');
    expect(behindFarPlaneElement.style.visibility).toBe('hidden');
  });

  test('Triggers position update callback', () => {
    // Arrange
    const helper = new HtmlOverlayTool(viewer);
    const behindCameraElement = document.createElement('div');
    behindCameraElement.style.position = 'absolute';
    const behindFarPlaneElement = document.createElement('div');
    behindFarPlaneElement.style.position = 'absolute';
    const withinNearAndFarPlaneElement = document.createElement('div');
    withinNearAndFarPlaneElement.style.position = 'absolute';
    const options: HtmlOverlayOptions = { positionUpdatedCallback: jest.fn() };

    // Act
    helper.add(behindCameraElement, new THREE.Vector3(0, 0, -1), options);
    helper.add(behindFarPlaneElement, new THREE.Vector3(0, 0, 10), options);
    helper.add(withinNearAndFarPlaneElement, new THREE.Vector3(0, 0, 0.5), options);

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
    const initialNumberOfElements = canvasContainer.children.length;
    const helper = new HtmlOverlayTool(viewer);
    for (let i = 0; i < 10; i++) {
      const element = document.createElement('div');
      element.style.position = 'absolute';
      helper.add(element, new THREE.Vector3(0, 0, 0));
    }
    expect(canvasContainer.children.length).toBe(initialNumberOfElements + 10);

    // Act
    helper.dispose();

    // Assert
    expect(canvasContainer.children.length).toBe(initialNumberOfElements);
  });

  test('all elements are removed when viewer is disposed', () => {
    // Arrange
    const initialNumberOfElements = canvasContainer.children.length;
    const helper = new HtmlOverlayTool(viewer);
    for (let i = 0; i < 10; i++) {
      const element = document.createElement('div');
      element.style.position = 'absolute';
      helper.add(element, new THREE.Vector3(0, 0, 0));
    }

    // Act
    viewer.dispose();

    // Assert
    expect(canvasContainer.children.length).toBeLessThanOrEqual(initialNumberOfElements);
  });
});
