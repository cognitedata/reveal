/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { CogniteClient } from '@cognite/sdk';
import { CdfModelMetadataProvider, CdfModelDataProvider, File3dFormat } from '@reveal/data-providers';
import type { SectorCuller } from '@reveal/cad-geometry-loaders';

import { Cognite3DViewer } from './Cognite3DViewer';
import { Image360ApiHelper } from '../../api-helpers/Image360ApiHelper';

import { It, Mock } from 'moq.ts';
import type { BeforeSceneRenderedDelegate, DisposedDelegate, SceneRenderedDelegate } from '@reveal/utilities';
import { CustomObject } from '@reveal/utilities';
import { mockClientAuthentication, autoMockWebGLRenderer } from '../../../../../test-utilities';
import type { DataSourceType } from '@reveal/data-providers';
import type { DefaultImage360Collection, Image360ClusterIntersectionData, Image360Entity } from '@reveal/360-images';

import { vi } from 'vitest';
import type { ResolutionOptions } from './types';

const sceneJson = (await import('./Cognite3DViewer.test-scene.json.json', { with: { type: 'json' } })).default;

describe('Cognite3DViewer', () => {
  const sdk = new CogniteClient({ appId: 'cognite.reveal.unittest', project: 'dummy', getToken: async () => 'dummy' });
  mockClientAuthentication(sdk);

  const renderer = autoMockWebGLRenderer(new Mock<THREE.WebGLRenderer>()).object();
  renderer.render = vi.fn();
  const _sectorCuller = new Mock<SectorCuller>()
    .setup(p => p.determineSectors(It.IsAny()))
    .returns({ wantedSectors: [], spentBudget: {} as any })
    .setup(p => p.dispose)
    .returns(vi.fn())
    .object();

  beforeAll(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response('', { status: 200 }));

    // Mock function for retriving model metadata, such as transformation
    vi.spyOn(sdk.revisions3D, 'retrieve').mockImplementation(async (_modelId, revisionId) => ({
      id: revisionId,
      fileId: 42,
      published: false,
      status: 'Done',
      createdTime: new Date(),
      assetMappingCount: 0
    }));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('dispose does not dispose of externally supplied renderer', () => {
    const disposeSpy = vi.spyOn(renderer, 'dispose');
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller, logMetrics: false });
    viewer.dispose();
    expect(disposeSpy).not.toHaveBeenCalled();
  });

  test('dispose disposes of sector culler', () => {
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller, logMetrics: false });
    viewer.dispose();
    expect(_sectorCuller.dispose).toHaveBeenCalledTimes(1);
  });

  test('dispose raises disposed-event', () => {
    const disposedListener: DisposedDelegate = vi.fn();
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller, logMetrics: false });
    viewer.on('disposed', disposedListener);

    viewer.dispose();

    expect(disposedListener).toHaveBeenCalledTimes(1);
  });

  test('dispose removes and disposes all models', async () => {
    // Arrange
    vi.spyOn(CdfModelMetadataProvider.prototype, 'getModelOutputs').mockResolvedValue([
      { format: File3dFormat.GltfCadModel, version: 9, blobId: 1 }
    ]);
    vi.spyOn(CdfModelDataProvider.prototype, 'getJsonFile').mockResolvedValue(sceneJson);

    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller, logMetrics: false });
    const model = await viewer.addModel({ modelId: 1, revisionId: 2 });
    const disposeSpy = vi.spyOn(model, 'dispose');

    viewer.dispose();

    expect(viewer.models).toHaveLength(0);
    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  test('on cameraChange triggers when position and target is changed', () => {
    // Arrange
    const onCameraChange: (position: THREE.Vector3, target: THREE.Vector3) => void = vi.fn();
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller, logMetrics: false });
    viewer.on('cameraChange', onCameraChange);

    // Act
    viewer.cameraManager.setCameraState({ position: new THREE.Vector3(123, 456, 789) });
    viewer.cameraManager.setCameraState({ target: new THREE.Vector3(1, 2, 3) });

    // Assert
    expect(onCameraChange).toHaveBeenCalledTimes(2);
  });

  test('addModel with remote model and fit viewer, updates camera', async () => {
    // Arrange
    vi.spyOn(CdfModelMetadataProvider.prototype, 'getModelOutputs').mockResolvedValue([
      { format: File3dFormat.GltfCadModel, version: 9, blobId: 1 }
    ]);
    vi.spyOn(CdfModelDataProvider.prototype, 'getJsonFile').mockResolvedValue(sceneJson);

    const onCameraChange: (position: THREE.Vector3, target: THREE.Vector3) => void = vi.fn();
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller, logMetrics: false });
    viewer.on('cameraChange', onCameraChange);

    // Act
    const model = await viewer.addModel({ modelId: 1, revisionId: 2 });
    viewer.fitCameraToModel(model);
    TWEEN.update(TWEEN.now());

    // Assert
    expect(onCameraChange).toHaveBeenCalled();
  });

  test('fitCameraToBoundingBox with 0 duration, moves camera immediatly', () => {
    // Arrange
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller, logMetrics: false });
    const bbox = new THREE.Box3(new THREE.Vector3(1, 1, 1), new THREE.Vector3(2, 2, 2));
    const bSphere = bbox.getBoundingSphere(new THREE.Sphere());
    bSphere.radius *= 3;

    // Act
    viewer.fitCameraToBoundingBox(bbox, 0);
    TWEEN.update(TWEEN.now());

    // Assert
    const cameraState = viewer.cameraManager.getCameraState();
    expect(cameraState.target).toEqual(bbox.getCenter(new THREE.Vector3()));
    expect(bSphere.containsPoint(cameraState.position)).toBeTruthy();
  });

  test('fitCameraToBoundingBox with 1000 duration, moves camera over time', () => {
    // Arrange
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller, logMetrics: false });
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
    expect(bSphere.containsPoint(cameraState1.position)).toBeFalsy();
    TWEEN.update(now + 1000);

    // Assert
    const cameraState2 = viewer.cameraManager.getCameraState();
    expect(cameraState2.target).toEqual(bbox.getCenter(new THREE.Vector3()));
    expect(bSphere.containsPoint(cameraState2.position)).toBeTruthy();
  });

  test('viewer can add/remove Object3d on scene', () => {
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller, logMetrics: false });
    const obj = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());

    expect(() => viewer.addObject3D(obj)).not.toThrow();
    expect(() => viewer.removeObject3D(obj)).not.toThrow();
  });

  test('viewer can add/remove CustomObject on scene', () => {
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller, logMetrics: false });

    // Create 10 custom objects
    const customObjects: CustomObject[] = [];
    for (let i = 0; i < 10; i++) {
      const obj = new THREE.Mesh(new THREE.SphereGeometry(i), new THREE.MeshBasicMaterial());
      customObjects.push(new CustomObject(obj));
    }
    // Add them to the viewer
    for (const customObject of customObjects) {
      expect(() => viewer.addCustomObject(customObject)).not.toThrow();
    }
    // Remove them from the viewer
    for (const customObject of customObjects) {
      expect(() => viewer.removeCustomObject(customObject)).not.toThrow();
    }
  });

  test('beforeSceneRendered and sceneRendered triggers before/after rendering', () => {
    // Setup a fake rendering loop
    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      requestAnimationFrameCallback = cb;
      return 1;
    });
    let requestAnimationFrameCallback: FrameRequestCallback | undefined;
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller, logMetrics: false });
    const onBeforeRendered: BeforeSceneRenderedDelegate = vi.fn();
    const onRendered: SceneRenderedDelegate = vi.fn();
    if (!requestAnimationFrameCallback) throw new Error('Animation frame not triggered');

    try {
      viewer.on('beforeSceneRendered', onBeforeRendered);
      viewer.on('sceneRendered', onRendered);
      viewer.requestRedraw();
      requestAnimationFrameCallback(1000);
      expect(onBeforeRendered).toHaveBeenCalledTimes(1);
      expect(onRendered).toHaveBeenCalledTimes(1);

      vi.clearAllMocks();
      viewer.off('sceneRendered', onRendered);
      viewer.off('beforeSceneRendered', onBeforeRendered);
      viewer.requestRedraw();
      requestAnimationFrameCallback(1000);
      expect(onBeforeRendered).not.toHaveBeenCalled();
      expect(onRendered).not.toHaveBeenCalled();
    } finally {
      requestAnimationFrameSpy.mockRestore();
    }
  });

  test('fitCameraToBoundingBox with zero duration updates camera immediatly', () => {
    // Arrange
    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller, logMetrics: false });
    const box = new THREE.Box3(new THREE.Vector3(-1001, -1001, -1001), new THREE.Vector3(-1000, -1000, -1000));
    const { position: originalCameraPosition, target: originalCameraTarget } = viewer.cameraManager.getCameraState();

    // Act
    viewer.fitCameraToBoundingBox(box, 0);

    // Assert
    const cameraState = viewer.cameraManager.getCameraState();
    expect(cameraState.position).not.toEqual(originalCameraPosition);
    expect(cameraState.target).not.toEqual(originalCameraTarget);
  });

  test('resolution options are persisted when set', () => {
    const resolutionOptions: ResolutionOptions = { movingCameraResolutionFactor: 0.35, maxRenderResolution: 4e6 };

    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller, logMetrics: false });

    viewer.setResolutionOptions(resolutionOptions);

    expect(viewer.getResolutionOptions()).toEqual(resolutionOptions);
  });

  test('getAnyIntersectionFromPixel returns cluster intersection when a cluster is hit', async () => {
    const mockClusterData: Image360ClusterIntersectionData<DataSourceType> = {
      image360Collection: new Mock<DefaultImage360Collection<DataSourceType>>().object(),
      clusterPosition: new THREE.Vector3(5, 0, 0),
      clusterSize: 3,
      clusterIcons: [new Mock<Image360Entity<DataSourceType>>().object()],
      distanceToCamera: 15
    };

    const spyIntersectClusters = vi
      .spyOn(Image360ApiHelper.prototype, 'intersect360ImageClusters')
      .mockReturnValue(mockClusterData);

    const viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller, logMetrics: false });

    const result = await viewer.getAnyIntersectionFromPixel(new THREE.Vector2(100, 200));

    expect(result).toEqual({ type: 'image360Cluster', ...mockClusterData });

    spyIntersectClusters.mockRestore();
  });
});
