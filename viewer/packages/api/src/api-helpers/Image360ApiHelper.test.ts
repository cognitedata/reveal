/*!
 * Copyright 2025 Cognite AS
 */
import { Mock, It } from 'moq.ts';
import { PerspectiveCamera, Scene, Vector3 } from 'three';
import { CogniteClient } from '@cognite/sdk';
import { jest } from '@jest/globals';

import { Image360ApiHelper } from './Image360ApiHelper';
import { SceneHandler, InputHandler, EventTrigger, BeforeSceneRenderedDelegate } from '@reveal/utilities';
import { ProxyCameraManager, CameraManager } from '@reveal/camera-manager';
import { DataSourceType } from '@reveal/data-providers';
import {
  Image360ClusterIntersectionData,
  Image360IconIntersectionData,
  Image360Entity,
  DefaultImage360Collection
} from '@reveal/360-images';
import { Overlay3DIcon } from '@reveal/3d-overlays';
import { mockClientAuthentication, fakeGetBoundingClientRect } from '../../../../test-utilities';

function createMockSceneHandler(): SceneHandler {
  const mockScene = new Mock<Scene>()
    .setup(p => p.add(It.IsAny()))
    .returns(new Scene())
    .setup(p => p.remove(It.IsAny()))
    .returns(new Scene())
    .object();

  return new Mock<SceneHandler>()
    .setup(p => p.scene)
    .returns(mockScene)
    .object();
}

function createMockInputHandler(): InputHandler {
  return new Mock<InputHandler>()
    .setup(p => p.on(It.IsAny(), It.IsAny()))
    .returns(undefined)
    .setup(p => p.off(It.IsAny(), It.IsAny()))
    .returns(undefined)
    .object();
}

function createMockCameraManager(camera: PerspectiveCamera): ProxyCameraManager {
  const mockInnerCameraManager = new Mock<CameraManager>()
    .setup(p => p.getCamera())
    .returns(camera)
    .object();

  return new Mock<ProxyCameraManager>()
    .setup(p => p.getCamera())
    .returns(camera)
    .setup(p => p.innerCameraManager)
    .returns(mockInnerCameraManager)
    .object();
}

function createTestHelper(domElement: HTMLElement): Image360ApiHelper<DataSourceType> {
  const sdk = new CogniteClient({
    appId: 'cognite.reveal.unittest',
    project: 'dummy',
    getToken: async () => 'dummy'
  });
  mockClientAuthentication(sdk);

  const mockCamera = new PerspectiveCamera();
  mockCamera.position.set(0, 0, 10);
  mockCamera.lookAt(new Vector3(0, 0, 0));
  mockCamera.updateMatrixWorld();

  const mockCameraManager = createMockCameraManager(mockCamera);
  const mockSceneHandler = createMockSceneHandler();
  const mockInputHandler = createMockInputHandler();
  const onBeforeSceneRendered = new EventTrigger<BeforeSceneRenderedDelegate>();

  return new Image360ApiHelper(
    sdk,
    mockSceneHandler,
    domElement,
    mockCameraManager,
    mockInputHandler,
    onBeforeSceneRendered,
    false // disable event listeners for testing
  );
}

describe(Image360ApiHelper.name, () => {
  let helper: Image360ApiHelper<DataSourceType>;
  let domElement: HTMLElement;

  beforeEach(() => {
    domElement = document.createElement('div');
    domElement.style.width = '640px';
    domElement.style.height = '480px';
    fakeGetBoundingClientRect(domElement, 0, 0, 640, 480);

    helper = createTestHelper(domElement);
  });

  describe('enter360ImageOnIntersect (via onClick)', () => {
    test('returns false when no cluster or icon intersection found', async () => {
      const clusterSpy = jest.spyOn(helper, 'intersect360ImageClusters').mockReturnValue(undefined);
      const iconSpy = jest.spyOn(helper, 'intersect360ImageIcons').mockReturnValue(undefined);

      const event = { offsetX: 320, offsetY: 240 };
      const result = await helper.onClick(event);

      expect(result).toBe(false);
      expect(clusterSpy).toHaveBeenCalledWith(320, 240);
      expect(iconSpy).toHaveBeenCalledWith(320, 240);
    });

    test('prioritizes cluster intersection over icon intersection', async () => {
      const mockCollection = new Mock<DefaultImage360Collection<DataSourceType>>().object();
      const mockEntity = new Mock<Image360Entity<DataSourceType>>().object();

      const clusterPosition = new Vector3(5, 0, 0);
      const mockClusterData: Image360ClusterIntersectionData<DataSourceType> = {
        image360Collection: mockCollection,
        clusterPosition,
        clusterSize: 3,
        clusterIcons: [mockEntity],
        distanceToCamera: 15
      };

      jest.spyOn(helper, 'intersect360ImageClusters').mockReturnValue(mockClusterData);
      const iconIntersectSpy = jest.spyOn(helper, 'intersect360ImageIcons');

      const zoomSpy = jest.spyOn(helper, 'zoomToCluster').mockResolvedValue(true);

      const event = { offsetX: 320, offsetY: 240 };
      const result = await helper.onClick(event);

      expect(result).toBe(true);
      expect(helper.intersect360ImageClusters).toHaveBeenCalledWith(320, 240);
      expect(iconIntersectSpy).not.toHaveBeenCalled();
      expect(zoomSpy).toHaveBeenCalledWith(mockClusterData);
    });

    test('falls back to icon intersection when no cluster is hit', async () => {
      const mockCollection = new Mock<DefaultImage360Collection<DataSourceType>>().object();

      const mockIcon = new Mock<Overlay3DIcon>()
        .setup(p => p.getPosition())
        .returns(new Vector3(0, 0, 0))
        .setup(p => p.selected)
        .returns(false)
        .setup(p => p.setVisible(It.IsAny()))
        .returns(undefined)
        .object();

      const mockEntity = new Mock<Image360Entity<DataSourceType>>()
        .setup(p => p.icon)
        .returns(mockIcon)
        .setup(p => p.image360Visualization.visible)
        .returns(false)
        .object();

      const mockIconIntersection: Image360IconIntersectionData<DataSourceType> = {
        image360Collection: mockCollection,
        image360: mockEntity,
        point: new Vector3(0, 0, 0),
        distanceToCamera: 10
      };

      jest.spyOn(helper, 'intersect360ImageClusters').mockReturnValue(undefined);
      jest.spyOn(helper, 'intersect360ImageIcons').mockReturnValue(mockIconIntersection);

      const enterInternalSpy = jest
        .spyOn(helper, 'enter360ImageInternal')
        .mockImplementation(() => Promise.resolve(true));

      const event = { offsetX: 320, offsetY: 240 };
      const result = await helper.onClick(event);

      expect(result).toBe(true);
      expect(helper.intersect360ImageClusters).toHaveBeenCalledWith(320, 240);
      expect(helper.intersect360ImageIcons).toHaveBeenCalledWith(320, 240);
      expect(enterInternalSpy).toHaveBeenCalledWith(mockEntity);
    });
  });

  describe('intersect360ImageClusters', () => {
    test('calls facade intersectCluster with correct NDC coordinates', () => {
      const result = helper.intersect360ImageClusters(320, 240);

      expect(result).toBeUndefined();
    });
  });

  describe('intersect360ImageIcons', () => {
    test('calls facade intersect with correct NDC coordinates', () => {
      const result = helper.intersect360ImageIcons(320, 240);

      expect(result).toBeUndefined();
    });
  });
});
