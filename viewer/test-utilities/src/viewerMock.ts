/*!
 * Copyright 2023 Cognite AS
 */

import { mockClientAuthentication } from './cogniteClientAuth';

import { CogniteClient } from '@cognite/sdk';
import { Cognite3DViewer } from '../../packages/api';
import { Camera, PerspectiveCamera, Vector3, WebGLRenderer } from 'three';

import { jest } from '@jest/globals';
import { Mock } from 'moq.ts';
import { autoMockWebGLRenderer } from './populateWebGLRendererMock';

export function mockViewer(): Cognite3DViewer {
  return mockViewerComponents().viewer;
}

export function mockViewerComponents(): {
  viewer: Cognite3DViewer;
  canvasContainer: HTMLElement;
  camera: Camera;
  renderer: WebGLRenderer;
} {
  const sdk = new CogniteClient({
    appId: 'cognite.reveal.unittest',
    project: 'dummy',
    getToken: async () => 'dummy'
  });
  mockClientAuthentication(sdk);
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  fakeGetBoundingClientRect(canvas, 0, 0, 128, 128);

  const renderer = autoMockWebGLRenderer(new Mock<WebGLRenderer>(), { canvas }).object();
  renderer.render = jest.fn();

  const canvasContainer = document.createElement('div');
  canvasContainer.style.width = '640px';
  canvasContainer.style.height = '480px';

  const camera = new PerspectiveCamera();
  camera.position.set(0, 0, 0);
  camera.near = 0.1;
  camera.far = 1.0;
  camera.lookAt(new Vector3(0, 0, 1));
  camera.updateProjectionMatrix();
  camera.updateMatrix();

  const viewer = new Cognite3DViewer({ domElement: canvasContainer, sdk, renderer });
  jest.spyOn(viewer.cameraManager, 'getCamera').mockReturnValue(camera);

  renderer.setSize(128, 128);

  return {
    viewer,
    camera,
    canvasContainer,
    renderer
  };
}

export function fakeGetBoundingClientRect(
  element: HTMLElement,
  x: number,
  y: number,
  width: number,
  height: number
): void {
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
