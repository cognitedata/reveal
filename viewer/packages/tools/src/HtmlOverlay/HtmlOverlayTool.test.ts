/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import {
  HtmlOverlayOptions,
  HtmlOverlayTool,
  HtmlOverlayToolOptions,
  HtmlOverlayCreateClusterDelegate
} from './HtmlOverlayTool';

import { CogniteClient } from '@cognite/sdk';
import { createGlContext, mockClientAuthentication } from '../../../../test-utilities';
import { Cognite3DViewer } from '@reveal/api';

describe(HtmlOverlayTool.name, () => {
  let canvasContainer: HTMLElement;
  let viewer: Cognite3DViewer;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;

  beforeEach(() => {
    const sdk = new CogniteClient({
      appId: 'cognite.reveal.unittest',
      project: 'dummy',
      getToken: async () => 'dummy'
    });
    mockClientAuthentication(sdk);
    const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
    const canvas = document.createElement('canvas');
    fakeGetBoundingClientRect(canvas, 0, 0, 128, 128);

    renderer = new THREE.WebGLRenderer({ context, canvas });
    renderer.render = jest.fn();

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

    viewer = new Cognite3DViewer({ domElement: canvasContainer, sdk, renderer });
    jest.spyOn(viewer, 'getCamera').mockReturnValue(camera);

    renderer.setSize(128, 128);
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

  test('add() places overlays correctly', () => {
    // Arrange
    const helper = new HtmlOverlayTool(viewer);
    const htmlElement = document.createElement('div');
    htmlElement.style.position = 'absolute';
    expect(htmlElement.style.top).toBeEmpty();
    expect(htmlElement.style.left).toBeEmpty();
    const position = new THREE.Vector3(0, 0, 0.5);

    // Act
    helper.add(htmlElement, position);
    helper.forceUpdate();

    // Assert
    expect(htmlElement.style.visibility).toBe('visible');
    expect(htmlElement.style.left).toBe(`${renderer.domElement.width / 2}px`);
    expect(htmlElement.style.top).toBe(`${renderer.domElement.height / 2}px`);
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
    helper.forceUpdate();

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
    helper.add(behindCameraElement, new THREE.Vector3(0, 0, -1), { ...options, userData: 'behindCameraElement' });
    helper.add(behindFarPlaneElement, new THREE.Vector3(0, 0, 10), { ...options, userData: 'behindFarPlaneElement' });
    helper.add(withinNearAndFarPlaneElement, new THREE.Vector3(0, 0, 0.5), {
      ...options,
      userData: 'withinNearAndFarPlaneElement'
    });
    helper.forceUpdate();

    // Assert
    expect(options.positionUpdatedCallback).toHaveBeenCalledWith(
      behindCameraElement,
      expect.any(THREE.Vector2),
      expect.any(THREE.Vector3),
      expect.anything(),
      'behindCameraElement'
    );
    expect(options.positionUpdatedCallback).toHaveBeenCalledWith(
      behindFarPlaneElement,
      expect.any(THREE.Vector2),
      expect.any(THREE.Vector3),
      expect.anything(),
      'behindFarPlaneElement'
    );
    expect(options.positionUpdatedCallback).toHaveBeenCalledWith(
      withinNearAndFarPlaneElement,
      expect.any(THREE.Vector2),
      expect.any(THREE.Vector3),
      expect.anything(),
      'withinNearAndFarPlaneElement'
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

  test('screenspace clustering combines overlapping elements', () => {
    // Arrange
    const createClusterElementCallback: HtmlOverlayCreateClusterDelegate = jest
      .fn()
      .mockReturnValue(document.createElement('div'));
    const options: HtmlOverlayToolOptions = {
      clusteringOptions: { mode: 'overlapInScreenSpace', createClusterElementCallback }
    };
    const helper = new HtmlOverlayTool(viewer, options);

    const div1 = document.createElement('div');
    fakeGetBoundingClientRect(div1, 0, 0, 64, 18);
    div1.style.position = 'absolute';
    const div2 = document.createElement('div');
    div2.style.position = 'absolute';
    fakeGetBoundingClientRect(div2, 0, 0, 64, 18);

    // Act
    helper.add(div1, new THREE.Vector3(0, 0, 0.5));
    helper.add(div2, new THREE.Vector3(0, 0, 0.7));
    helper.forceUpdate();

    // Assert
    expect(createClusterElementCallback).toBeCalledTimes(1);
    expect(div1.style.visibility).toEqual('hidden');
    expect(div2.style.visibility).toEqual('hidden');
  });

  test('clear() removes composite elements', () => {
    // Arrange
    const compositeElement = document.createElement('div');
    const createClusterElementCallback: HtmlOverlayCreateClusterDelegate = jest.fn().mockReturnValue(compositeElement);
    const options: HtmlOverlayToolOptions = {
      clusteringOptions: { mode: 'overlapInScreenSpace', createClusterElementCallback }
    };
    const helper = new HtmlOverlayTool(viewer, options);

    const div1 = document.createElement('div');
    fakeGetBoundingClientRect(div1, 0, 0, 64, 18);
    div1.style.position = 'absolute';
    const div2 = document.createElement('div');
    div2.style.position = 'absolute';
    fakeGetBoundingClientRect(div2, 0, 0, 64, 18);

    // Act
    helper.add(div1, new THREE.Vector3(0, 0, 0.5));
    helper.add(div2, new THREE.Vector3(0, 0, 0.7));
    helper.forceUpdate();
    expect(div1.parentElement).not.toBeNull();
    expect(div2.parentElement).not.toBeNull();
    expect(compositeElement.parentElement).not.toBeNull();
    helper.clear();

    // Assert
    expect(div1.parentElement).toBeNull();
    expect(div2.parentElement).toBeNull();
    expect(compositeElement.parentElement).toBeNull();
  });
});

function fakeGetBoundingClientRect(element: HTMLElement, x: number, y: number, width: number, height: number) {
  const rect: DOMRect = {
    left: x,
    right: x + width,
    top: y,
    bottom: y + height,
    width: width,
    height: height,
    x,
    y,
    toJSON: () => {}
  };
  element.getBoundingClientRect = jest.fn(() => rect);
}
