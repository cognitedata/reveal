import { CogniteClient } from '@cognite/sdk/dist/src';
import { Cognite3DViewer } from '@reveal/api';
import { createGlContext, mockClientAuthentication } from 'test-utilities';
import { Camera, PerspectiveCamera, Vector3, WebGLRenderer } from 'three';

const context = await createGlContext(64, 64, { preserveDrawingBuffer: true });

export function mockViewer(): Cognite3DViewer {
  return mockViewerComponents().viewer;
}

export function mockViewerComponents(): {
  viewer: Cognite3DViewer;
  canvasContainer: HTMLElement;
  camera: Camera;
  renderer: WebGLRenderer;
} {
  let canvasContainer: HTMLElement;
  let viewer: Cognite3DViewer;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;

  const sdk = new CogniteClient({
    appId: 'cognite.reveal.unittest',
    project: 'dummy',
    getToken: async () => 'dummy'
  });
  mockClientAuthentication(sdk);
  const canvas = document.createElement('canvas');
  fakeGetBoundingClientRect(canvas, 0, 0, 128, 128);

  renderer = new WebGLRenderer({ context, canvas });
  renderer.render = jest.fn();

  canvasContainer = document.createElement('div');
  canvasContainer.style.width = '640px';
  canvasContainer.style.height = '480px';

  camera = new PerspectiveCamera();
  camera.position.set(0, 0, 0);
  camera.near = 0.1;
  camera.far = 1.0;
  camera.lookAt(new Vector3(0, 0, 1));
  camera.updateProjectionMatrix();
  camera.updateMatrix();

  viewer = new Cognite3DViewer({ domElement: canvasContainer, sdk, renderer });
  jest.spyOn(viewer.cameraManager, 'getCamera').mockReturnValue(camera);

  renderer.setSize(128, 128);

  return {
    viewer,
    camera,
    canvasContainer,
    renderer
  };
}

export function fakeGetBoundingClientRect(element: HTMLElement, x: number, y: number, width: number, height: number) {
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
