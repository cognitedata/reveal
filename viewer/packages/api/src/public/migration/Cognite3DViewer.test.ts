/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { CogniteClient } from '@cognite/sdk';
import { SectorCuller } from '@reveal/cad-geometry-loaders';

import { Cognite3DViewer } from './Cognite3DViewer';

import nock from 'nock';
import { Mock } from 'moq.ts';
import { BeforeSceneRenderedDelegate, CustomObject, DisposedDelegate, SceneRenderedDelegate } from '@reveal/utilities';
import { mockClientAuthentication, autoMockWebGLRenderer } from '../../../../../test-utilities';

import { jest } from '@jest/globals';

const sceneJson = (await import('./Cognite3DViewer.test-scene.json.json', { assert: { type: 'json' } })).default;

describe('Cognite3DViewer', () => {
  const sdk = new CogniteClient({ appId: 'cognite.reveal.unittest', project: 'dummy', getToken: async () => 'dummy' });
  mockClientAuthentication(sdk);

  const renderer = autoMockWebGLRenderer(new Mock<THREE.WebGLRenderer>()).object();
  renderer.render = jest.fn();
  const _sectorCuller = new Mock<SectorCuller>()
    .setup(p => p.dispose)
    .returns(jest.fn())
    .object();

  beforeAll(() => {
    nock.disableNetConnect();

    nock('https://api-js.mixpanel.com')
      .persist(true)
      .defaultReplyHeaders({ 'access-control-allow-origin': '*', 'access-control-allow-credentials': 'true' })
      .get(/.*/)
      .reply(200);

    nock('https://api-js.mixpanel.com')
      .persist(true)
      .defaultReplyHeaders({ 'access-control-allow-origin': '*', 'access-control-allow-credentials': 'true' })
      .post(/.*/)
      .reply(200);

    // Mock function for retriving model metadata, such as transformation
    jest.spyOn(sdk.revisions3D, 'retrieve').mockImplementation(async (_modelId, revisionId) => ({
      id: revisionId,
      fileId: 42,
      published: false,
      status: 'Done',
      createdTime: new Date(),
      assetMappingCount: 0
    }));
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('dispose does not dispose of externally supplied renderer', () => {
    const disposeSpy = jest.spyOn(renderer, 'dispose');
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller });
    viewer.dispose();
    expect(disposeSpy).not.toBeCalled();
  });

  test('dispose disposes of sector culler', () => {
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller });
    viewer.dispose();
    expect(_sectorCuller.dispose).toBeCalledTimes(1);
  });

  test('dispose raises disposed-event', () => {
    const disposedListener: DisposedDelegate = jest.fn();
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller });
    viewer.on('disposed', disposedListener);

    viewer.dispose();

    expect(disposedListener).toBeCalledTimes(1);
  });

  test('dispose removes and disposes all models', async () => {
    // Arrange
    const outputs = {
      items: [
        {
          format: 'gltf-directory',
          version: 9,
          blobId: 1
        }
      ]
    };
    nock(/.*/)
      .defaultReplyHeaders({ 'access-control-allow-origin': '*', 'access-control-allow-credentials': 'true' })
      .get(/.*\/outputs/)
      .twice() // the first one goes to determine model type
      .reply(200, outputs);
    nock(/.*/)
      .defaultReplyHeaders({ 'access-control-allow-origin': '*', 'access-control-allow-credentials': 'true' })
      .get(/.*\/scene.json/)
      .reply(200, sceneJson);

    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller });
    const model = await viewer.addModel({ modelId: 1, revisionId: 2 });
    const disposeSpy = jest.spyOn(model, 'dispose');

    viewer.dispose();

    expect(viewer.models).toBeEmpty();
    expect(disposeSpy).toBeCalledTimes(1);
  });

  test('on cameraChange triggers when position and target is changed', () => {
    // Arrange
    const onCameraChange: (position: THREE.Vector3, target: THREE.Vector3) => void = jest.fn();
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller });
    viewer.on('cameraChange', onCameraChange);

    // Act
    viewer.cameraManager.setCameraState({ position: new THREE.Vector3(123, 456, 789) });
    viewer.cameraManager.setCameraState({ target: new THREE.Vector3(1, 2, 3) });

    // Assert
    expect(onCameraChange).toBeCalledTimes(2);
  });

  test('addModel with remote model and fit viewer, updates camera', async () => {
    // Arrange
    const outputs = {
      items: [
        {
          format: 'gltf-directory',
          version: 9,
          blobId: 1
        }
      ]
    };
    nock(/.*/)
      .defaultReplyHeaders({ 'access-control-allow-origin': '*', 'access-control-allow-credentials': 'true' })
      .get(/.*\/outputs/)
      .twice() // the first one goes to determine model type
      .reply(200, outputs);
    nock(/.*/)
      .defaultReplyHeaders({ 'access-control-allow-origin': '*', 'access-control-allow-credentials': 'true' })
      .get(/.*\/scene.json/)
      .reply(200, sceneJson);

    const onCameraChange: (position: THREE.Vector3, target: THREE.Vector3) => void = jest.fn();
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller });
    viewer.on('cameraChange', onCameraChange);

    // Act
    const model = await viewer.addModel({ modelId: 1, revisionId: 2 });
    viewer.fitCameraToModel(model);
    TWEEN.update(TWEEN.now());

    // Assert
    expect(onCameraChange).toBeCalled();
  });

  test('fitCameraToBoundingBox with 0 duration, moves camera immediatly', () => {
    // Arrange
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller });
    const bbox = new THREE.Box3(new THREE.Vector3(1, 1, 1), new THREE.Vector3(2, 2, 2));
    const bSphere = bbox.getBoundingSphere(new THREE.Sphere());
    bSphere.radius *= 3;

    // Act
    viewer.fitCameraToBoundingBox(bbox, 0);
    TWEEN.update(TWEEN.now());

    // Assert
    const cameraState = viewer.cameraManager.getCameraState();
    expect(cameraState.target).toEqual(bbox.getCenter(new THREE.Vector3()));
    expect(bSphere.containsPoint(cameraState.position)).toBeTrue();
  });

  test('fitCameraToBoundingBox with 1000 duration, moves camera over time', () => {
    // Arrange
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller });
    const cameraManager = viewer.cameraManager;
    cameraManager.setCameraState({ position: new THREE.Vector3(30, 10, 50), target: new THREE.Vector3() });
    const bbox = new THREE.Box3(new THREE.Vector3(1, 1, 1), new THREE.Vector3(2, 2, 2));
    const bSphere = bbox.getBoundingSphere(new THREE.Sphere());
    bSphere.radius *= 3;

    // Act
    viewer.fitCameraToBoundingBox(bbox, 1000);
    const now = TWEEN.now();
    TWEEN.update(now + 500);
    const cameraState1 = viewer.cameraManager.getCameraState();
    expect(cameraState1.target).not.toEqual(bbox.getCenter(new THREE.Vector3()));
    expect(bSphere.containsPoint(cameraState1.position)).toBeFalse();
    TWEEN.update(now + 1000);

    // Assert
    const cameraState2 = viewer.cameraManager.getCameraState();
    expect(cameraState2.target).toEqual(bbox.getCenter(new THREE.Vector3()));
    expect(bSphere.containsPoint(cameraState2.position)).toBeTrue();
  });

  test('viewer can add/remove Object3d on scene', () => {
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller });
    const obj = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());

    expect(() => viewer.addObject3D(obj)).not.toThrowError();
    expect(() => viewer.removeObject3D(obj)).not.toThrowError();
  });

  test('viewer can add/remove CustomObject on scene', () => {
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller });

    // Create 10 custom objects
    const customObjects: CustomObject[] = [];
    for (let i = 0; i < 10; i++) {
      const obj = new THREE.Mesh(new THREE.SphereGeometry(i), new THREE.MeshBasicMaterial());
      customObjects.push(new CustomObject(obj));
    }
    // Add them to the viewer
    for (const customObject of customObjects) {
      expect(() => viewer.addCustomObject(customObject)).not.toThrowError();
    }
    // Remove them from the viewer
    for (const customObject of customObjects) {
      expect(() => viewer.removeCustomObject(customObject)).not.toThrowError();
    }
  });

  test('beforeSceneRendered and sceneRendered triggers before/after rendering', () => {
    // Setup a fake rendering loop
    const requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      requestAnimationFrameCallback = cb;
      return 1;
    });
    let requestAnimationFrameCallback: FrameRequestCallback | undefined;
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller });
    const onBeforeRendered: BeforeSceneRenderedDelegate = jest.fn();
    const onRendered: SceneRenderedDelegate = jest.fn();
    if (!requestAnimationFrameCallback) throw new Error('Animation frame not triggered');

    try {
      viewer.on('beforeSceneRendered', onBeforeRendered);
      viewer.on('sceneRendered', onRendered);
      viewer.requestRedraw();
      requestAnimationFrameCallback(1000);
      expect(onBeforeRendered).toBeCalledTimes(1);
      expect(onRendered).toBeCalledTimes(1);

      jest.clearAllMocks();
      viewer.off('sceneRendered', onRendered);
      viewer.off('beforeSceneRendered', onBeforeRendered);
      viewer.requestRedraw();
      requestAnimationFrameCallback(1000);
      expect(onBeforeRendered).not.toBeCalled();
      expect(onRendered).not.toBeCalled();
    } finally {
      requestAnimationFrameSpy.mockRestore();
    }
  });

  test('fitCameraToBoundingBox with zero duration updates camera immediatly', () => {
    // Arrange
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller });
    const box = new THREE.Box3(new THREE.Vector3(-1001, -1001, -1001), new THREE.Vector3(-1000, -1000, -1000));
    const { position: originalCameraPosition, target: originalCameraTarget } = viewer.cameraManager.getCameraState();

    // Act
    viewer.fitCameraToBoundingBox(box, 0);

    // Assert
    const cameraState = viewer.cameraManager.getCameraState();
    expect(cameraState.position).not.toEqual(originalCameraPosition);
    expect(cameraState.target).not.toEqual(originalCameraTarget);
  });
});
