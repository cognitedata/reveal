/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { CogniteClient } from '@cognite/sdk';
import { SectorCuller } from '@reveal/cad-geometry-loaders';

import { Cognite3DViewer } from './Cognite3DViewer';

import nock from 'nock';
import { DisposedDelegate, SceneRenderedDelegate } from '../types';
import { createGlContext, mockClientAuthentication } from '../../../../test-utilities';

const sceneJson = require('./Cognite3DViewer.test-scene.json');

describe('Cognite3DViewer', () => {
  const sdk = new CogniteClient({ appId: 'cognite.reveal.unittest', project: 'dummy', getToken: async () => 'dummy' });
  mockClientAuthentication(sdk);
  const context = createGlContext(64, 64, { preserveDrawingBuffer: true });

  const renderer = new THREE.WebGLRenderer({ context });
  const _sectorCuller: SectorCuller = {
    determineSectors: jest.fn(),
    filterSectorsToLoad: jest.fn(),
    dispose: jest.fn()
  };

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

  test('dispose disposes WebGL resources', () => {
    const disposeSpy = jest.spyOn(renderer, 'dispose');
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller });
    viewer.dispose();
    expect(disposeSpy).toBeCalledTimes(1);
    expect(_sectorCuller.dispose).toBeCalledTimes(1);
  });

  test('dispose raises disposed-event', () => {
    const disposedListener: DisposedDelegate = jest.fn();
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller });
    viewer.on('disposed', disposedListener);

    viewer.dispose();

    expect(disposedListener).toBeCalledTimes(1);
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
          format: 'reveal-directory',
          version: 8,
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
    const scene = viewer.getScene();
    const obj = new THREE.Mesh(new THREE.SphereBufferGeometry(), new THREE.MeshBasicMaterial());

    viewer.addObject3D(obj);
    expect(scene.getObjectById(obj.id)).toEqual(obj);

    viewer.removeObject3D(obj);
    expect(scene.getObjectById(obj.id)).toBeFalsy();
  });

  test('sceneRendered triggers after rendering', () => {
    // Setup a fake rendering loop
    const requestAnimationFrameSpy: jest.SpyInstance<any, any> = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(cb => {
        requestAnimationFrameCallback = cb;
        return 1;
      });
    let requestAnimationFrameCallback: FrameRequestCallback | undefined;
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller });
    const onRendered: SceneRenderedDelegate = jest.fn();
    if (!requestAnimationFrameCallback) throw new Error('Animation frame not triggered');

    try {
      viewer.on('sceneRendered', onRendered);
      viewer.requestRedraw();
      requestAnimationFrameCallback(1000);
      expect(onRendered).toBeCalledTimes(1);

      jest.clearAllMocks();
      viewer.off('sceneRendered', onRendered);
      viewer.requestRedraw();
      requestAnimationFrameCallback(1000);
      expect(onRendered).toBeCalledTimes(0);
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
