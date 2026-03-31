/*!
 * Copyright 2025 Cognite AS
 */
import { Mock, It } from 'moq.ts';
import { Matrix4, PerspectiveCamera, Scene, Vector3 } from 'three';
import TWEEN from '@tweenjs/tween.js';
import { CogniteClient } from '@cognite/sdk';
import { jest } from '@jest/globals';

import { Image360ApiHelper } from './Image360ApiHelper';
import { SceneHandler, InputHandler, EventTrigger, BeforeSceneRenderedDelegate } from '@reveal/utilities';
import {
  ProxyCameraManager,
  CameraManager,
  FlexibleCameraManager,
  CameraManagerCallbackData,
  DefaultCameraManager,
  isDefaultCameraManager
} from '@reveal/camera-manager';
import { DataSourceType } from '@reveal/data-providers';
import {
  Image360ClusterIntersectionData,
  Image360IconIntersectionData,
  Image360Entity,
  Image360Facade,
  DefaultImage360Collection,
  Image360RevisionEntity,
  Image360EnteredDelegate,
  Image360ExitedDelegate
} from '@reveal/360-images';
import { Overlay3DIcon } from '@reveal/3d-overlays';
import { mockClientAuthentication, fakeGetBoundingClientRect } from '../../../../test-utilities';
import { Image360VisualizationBox } from '../../../360-images/src/entity/Image360VisualizationBox';

function createMockRevision(): Image360RevisionEntity<DataSourceType> {
  return new Mock<Image360RevisionEntity<DataSourceType>>()
    .setup(r => r.applyFullResolutionTextures())
    .returns(Promise.resolve())
    .object();
}

function createMockVisualization(): Image360VisualizationBox {
  return new Mock<Image360VisualizationBox>()
    .setup(v => v.visible)
    .returns(false)
    .object();
}

function createMockIcon(): Overlay3DIcon {
  return new Mock<Overlay3DIcon>()
    .setup(i => i.setVisible(It.IsAny()))
    .returns(undefined)
    .object();
}

function createMockEntity(
  mockIcon: Overlay3DIcon,
  mockVisualization: Image360VisualizationBox,
  mockRevision: Image360RevisionEntity<DataSourceType>,
  position?: Vector3
): Image360Entity<DataSourceType> {
  return new Mock<Image360Entity<DataSourceType>>()
    .setup(e => e.icon)
    .returns(mockIcon)
    .setup(e => e.image360Visualization)
    .returns(mockVisualization)
    .setup(e => e.getActiveRevision())
    .returns(mockRevision)
    .setup(e => e.getMostRecentRevision())
    .returns(mockRevision)
    .setup(e => e.setActiveRevision(It.IsAny()))
    .returns(undefined)
    .setup(e => e.activateAnnotations())
    .returns(undefined)
    .setup(e => e.deactivateAnnotations())
    .returns(undefined)
    .setup(e => e.transform)
    .returns(position ? new Matrix4().makeTranslation(position.x, position.y, position.z) : new Matrix4())
    .object();
}

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
    .setup(p => p.dispose())
    .returns(undefined)
    .object();
}

function createMockClusterData(): Image360ClusterIntersectionData<DataSourceType> {
  const mockCollection = new Mock<DefaultImage360Collection<DataSourceType>>().object();
  const mockEntity = new Mock<Image360Entity<DataSourceType>>().object();

  return {
    image360Collection: mockCollection,
    clusterPosition: new Vector3(5, 0, 0),
    clusterSize: 3,
    clusterIcons: [mockEntity],
    distanceToCamera: 15
  };
}

type CameraManagerType = 'mock' | 'flexible' | 'default';

function createTestHelper(
  domElement: HTMLElement,
  sdk: CogniteClient,
  cameraManagerType: CameraManagerType = 'mock',
  iconsOptions?: { enableFloorIcons?: boolean }
): { helper: Image360ApiHelper<DataSourceType>; innerCameraManager: CameraManager } {
  const mockCamera = new PerspectiveCamera();
  mockCamera.position.set(0, 0, 10);
  mockCamera.lookAt(new Vector3(0, 0, 0));
  mockCamera.updateMatrixWorld();

  const mockInputHandler = createMockInputHandler();
  const mockRaycastCallback = jest.fn<() => Promise<CameraManagerCallbackData>>();

  let innerCameraManager: CameraManager;
  switch (cameraManagerType) {
    case 'flexible':
      innerCameraManager = new FlexibleCameraManager(domElement, mockRaycastCallback, mockCamera, undefined, false);
      break;
    case 'default':
      innerCameraManager = new DefaultCameraManager(domElement, mockInputHandler, mockRaycastCallback, mockCamera);
      break;
    case 'mock':
    default:
      innerCameraManager = new Mock<CameraManager>()
        .setup(p => p.getCamera())
        .returns(mockCamera)
        .object();
      break;
  }

  const proxyCameraManager = new Mock<ProxyCameraManager>()
    .setup(p => p.getCamera())
    .returns(mockCamera)
    .setup(p => p.innerCameraManager)
    .returns(innerCameraManager)
    .setup(p => p.setActiveCameraManager(It.IsAny()))
    .returns(undefined)
    .setup(p => p.setCameraState(It.IsAny()))
    .returns(undefined)
    .object();

  const mockSceneHandler = createMockSceneHandler();
  const onBeforeSceneRendered = new EventTrigger<BeforeSceneRenderedDelegate>();

  const helper = new Image360ApiHelper(
    sdk,
    mockSceneHandler,
    domElement,
    proxyCameraManager,
    mockInputHandler,
    onBeforeSceneRendered,
    false,
    iconsOptions
  );

  return { helper, innerCameraManager };
}

describe(Image360ApiHelper.name, () => {
  let helper: Image360ApiHelper<DataSourceType>;
  let domElement: HTMLElement;

  let sdk: CogniteClient;
  beforeEach(() => {
    domElement = document.createElement('div');
    domElement.style.width = '640px';
    domElement.style.height = '480px';
    fakeGetBoundingClientRect(domElement, 0, 0, 640, 480);

    sdk = new CogniteClient({
      appId: 'cognite.reveal.unittest',
      project: 'dummy',
      oidcTokenProvider: async () => 'dummy'
    });
    mockClientAuthentication(sdk);

    ({ helper } = createTestHelper(domElement, sdk));

    jest.useFakeTimers();
  });

  afterEach(async () => {
    helper.dispose();
    await jest.runOnlyPendingTimersAsync();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  async function enterImage(entity: Image360Entity<DataSourceType>): Promise<void> {
    const enterPromise = helper.enter360ImageInternal(entity);
    await Promise.resolve(); // flush preload microtask so tweens are created
    TWEEN.update(TWEEN.now() + 2000); // drive tween animations to completion
    await enterPromise;
  }

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
      const mockClusterData = createMockClusterData();

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
    test('returns undefined when no cluster is hit', () => {
      const result = helper.intersect360ImageClusters(320, 240);

      expect(result).toBeUndefined();
    });

    test('returns cluster data when facade finds a cluster', () => {
      const mockClusterData = createMockClusterData();
      jest.spyOn(Image360Facade.prototype, 'intersectCluster').mockReturnValue(mockClusterData);

      const result = helper.intersect360ImageClusters(320, 240);

      expect(result).toEqual(mockClusterData);
    });
  });

  describe('intersect360ImageIcons', () => {
    test('returns undefined when no icon is hit', () => {
      const result = helper.intersect360ImageIcons(320, 240);

      expect(result).toBeUndefined();
    });

    test('returns icon data when facade finds an icon', () => {
      const mockIconData: Image360IconIntersectionData<DataSourceType> = {
        image360Collection: new Mock<DefaultImage360Collection<DataSourceType>>().object(),
        image360: new Mock<Image360Entity<DataSourceType>>().object(),
        point: new Vector3(1, 2, 3),
        distanceToCamera: 10
      };
      jest.spyOn(Image360Facade.prototype, 'intersect').mockReturnValue(mockIconData);

      const result = helper.intersect360ImageIcons(320, 240);

      expect(result).toEqual(mockIconData);
    });
  });

  describe('zoomToCluster', () => {
    test('returns false when transition is already in progress for DefaultCameraManager', async () => {
      const { helper: defaultHelper } = createTestHelper(domElement, sdk, 'default');
      const mockClusterData = createMockClusterData();

      const firstZoomPromise = defaultHelper.zoomToCluster(mockClusterData);

      // Second call should detect transition in progress and return false
      const secondResult = await defaultHelper.zoomToCluster(mockClusterData);
      expect(secondResult).toBe(false);

      await jest.advanceTimersByTimeAsync(1000);
      await firstZoomPromise;
      defaultHelper.dispose();
    });

    test('uses DefaultCameraManager path and returns true', async () => {
      const { helper: defaultHelper, innerCameraManager } = createTestHelper(domElement, sdk, 'default');
      expect(isDefaultCameraManager(innerCameraManager)).toBe(true);

      const defaultCameraManager = innerCameraManager as DefaultCameraManager;
      const moveCameraToSpy = jest.spyOn(defaultCameraManager, 'moveCameraTo');
      const mockClusterData = createMockClusterData();

      const zoomPromise = defaultHelper.zoomToCluster(mockClusterData);
      await jest.advanceTimersByTimeAsync(1000);
      const result = await zoomPromise;

      expect(result).toBe(true);
      expect(moveCameraToSpy).toHaveBeenCalledTimes(1);

      const [targetPosition, clusterTarget, duration] = moveCameraToSpy.mock.calls[0];
      expect(targetPosition).toBeInstanceOf(Vector3);
      expect(clusterTarget).toBeInstanceOf(Vector3);
      expect(clusterTarget.x).toBe(5); // cluster position x from createMockClusterData
      expect(clusterTarget.y).toBe(0);
      expect(clusterTarget.z).toBe(0);
      expect(duration).toBe(800);

      innerCameraManager.dispose();
      defaultHelper.dispose();
    });

    test('uses FlexibleCameraManager path and returns true', async () => {
      const { helper: flexibleHelper } = createTestHelper(domElement, sdk, 'flexible');
      const mockClusterData = createMockClusterData();

      const zoomPromise = flexibleHelper.zoomToCluster(mockClusterData);
      await jest.advanceTimersByTimeAsync(1000);
      const result = await zoomPromise;

      expect(result).toBe(true);

      flexibleHelper.dispose();
    });

    test('returns false when transition is already in progress for FlexibleCameraManager', async () => {
      const { helper: flexibleHelper } = createTestHelper(domElement, sdk, 'flexible');
      const mockClusterData = createMockClusterData();

      const firstZoomPromise = flexibleHelper.zoomToCluster(mockClusterData);

      const secondResult = await flexibleHelper.zoomToCluster(mockClusterData);
      expect(secondResult).toBe(false);

      await jest.advanceTimersByTimeAsync(1000);
      await firstZoomPromise;
      flexibleHelper.dispose();
    });
  });

  describe('floor mode', () => {
    function createMockCollection(): DefaultImage360Collection<DataSourceType> {
      return new Mock<DefaultImage360Collection<DataSourceType>>()
        .setup(c => c.setFloorMode)
        .returns(jest.fn())
        .setup(c => c.getIconsVisibility())
        .returns(true)
        .setup(c => c.setIconsVisibility(It.IsAny()))
        .returns(undefined)
        .setup(c => c.isCollectionVisible)
        .returns(true)
        .setup(c => c.getImagesOpacity())
        .returns(1)
        .setup(c => c.events)
        .returns({
          image360Entered: new EventTrigger<Image360EnteredDelegate<DataSourceType>>(),
          image360Exited: new EventTrigger<Image360ExitedDelegate>()
        })
        .object();
    }

    function createFloorModeFixture() {
      const mockEntity = createMockEntity(createMockIcon(), createMockVisualization(), createMockRevision());
      const mockCollection = createMockCollection();

      jest.spyOn(Image360Facade.prototype, 'preload').mockResolvedValue(undefined);
      jest.spyOn(Image360Facade.prototype, 'getCollectionContainingEntity').mockReturnValue(mockCollection);
      jest.spyOn(Image360Facade.prototype, 'collections', 'get').mockReturnValue([mockCollection]);

      return { mockEntity, mockCollection };
    }

    test('does not call setFloorMode(true) on enter when enableFloorIcons is false (default)', async () => {
      const { mockEntity } = createFloorModeFixture();
      const mockCollection = createMockCollection();
      jest.spyOn(Image360Facade.prototype, 'collections', 'get').mockReturnValue([mockCollection]);

      await enterImage(mockEntity);

      expect(jest.mocked(mockCollection.setFloorMode)).not.toHaveBeenCalledWith(true);
    });

    test('calls setFloorMode(true) on ALL collections on enter when enableFloorIcons is true', async () => {
      const { helper: floorHelper } = createTestHelper(domElement, sdk, 'mock', { enableFloorIcons: true });
      const { mockEntity } = createFloorModeFixture();
      const mockCollection1 = createMockCollection();
      const mockCollection2 = createMockCollection();
      jest.spyOn(Image360Facade.prototype, 'collections', 'get').mockReturnValue([mockCollection1, mockCollection2]);

      const enterPromise = floorHelper.enter360ImageInternal(mockEntity);
      await Promise.resolve();
      TWEEN.update(TWEEN.now() + 2000);
      await enterPromise;

      expect(jest.mocked(mockCollection1.setFloorMode)).toHaveBeenCalledExactlyOnceWith(true);
      expect(jest.mocked(mockCollection2.setFloorMode)).toHaveBeenCalledExactlyOnceWith(true);
      floorHelper.dispose();
    });

    test('calls setFloorMode(false) on ALL collections when exiting regardless of enableFloorIcons', async () => {
      const { helper: floorHelper } = createTestHelper(domElement, sdk, 'mock', { enableFloorIcons: true });
      const { mockEntity } = createFloorModeFixture();
      const mockCollection1 = createMockCollection();
      const mockCollection2 = createMockCollection();
      jest.spyOn(Image360Facade.prototype, 'collections', 'get').mockReturnValue([mockCollection1, mockCollection2]);

      const enterPromise = floorHelper.enter360ImageInternal(mockEntity);
      await Promise.resolve();
      TWEEN.update(TWEEN.now() + 2000);
      await enterPromise;
      jest.mocked(mockCollection1.setFloorMode).mockClear();
      jest.mocked(mockCollection2.setFloorMode).mockClear();

      floorHelper.exit360Image();

      expect(jest.mocked(mockCollection1.setFloorMode)).toHaveBeenCalledExactlyOnceWith(false);
      expect(jest.mocked(mockCollection2.setFloorMode)).toHaveBeenCalledExactlyOnceWith(false);
      floorHelper.dispose();
    });
  });

  describe('findBestNext360ImageEntity', () => {
    function makeCandidateEntityAt(position: Vector3): Image360Entity<DataSourceType> {
      return new Mock<Image360Entity<DataSourceType>>()
        .setup(e => e.transform)
        .returns(new Matrix4().makeTranslation(position.x, position.y, position.z))
        .object();
    }

    function makeCandidateCollection(
      entities: Image360Entity<DataSourceType>[]
    ): DefaultImage360Collection<DataSourceType> {
      return new Mock<DefaultImage360Collection<DataSourceType>>()
        .setup(c => c.image360Entities)
        .returns(entities)
        .object();
    }

    async function enterAt(position: Vector3): Promise<Image360Entity<DataSourceType>> {
      const entity = createMockEntity(createMockIcon(), createMockVisualization(), createMockRevision(), position);
      const enterCollection = new Mock<DefaultImage360Collection<DataSourceType>>()
        .setup(c => c.isCollectionVisible)
        .returns(true)
        .setup(c => c.events)
        .returns({
          image360Entered: new EventTrigger<Image360EnteredDelegate<DataSourceType>>(),
          image360Exited: new EventTrigger<Image360ExitedDelegate>()
        })
        .object();
      jest.spyOn(Image360Facade.prototype, 'preload').mockResolvedValue(undefined);
      jest.spyOn(Image360Facade.prototype, 'getCollectionContainingEntity').mockReturnValue(enterCollection);
      await enterImage(entity);
      return entity;
    }

    test('returns undefined when not inside a 360 image', () => {
      jest.spyOn(Image360Facade.prototype, 'collections', 'get').mockReturnValue([]);

      expect(helper.findBestNext360ImageEntity(new Vector3(10, 0, 0))).toBeUndefined();
    });

    test('returns undefined when no entity lies in the click direction', async () => {
      const current = await enterAt(new Vector3(0, 0, 0));
      const behind = makeCandidateEntityAt(new Vector3(-5, 0, 0));
      jest
        .spyOn(Image360Facade.prototype, 'collections', 'get')
        .mockReturnValue([makeCandidateCollection([current, behind])]);

      // Click toward +X; behind entity is at -X
      expect(helper.findBestNext360ImageEntity(new Vector3(10, 0, 0))).toBeUndefined();
    });

    test('returns the nearest entity in the click direction', async () => {
      const current = await enterAt(new Vector3(0, 0, 0));
      const near = makeCandidateEntityAt(new Vector3(3, 0, 0));
      const far = makeCandidateEntityAt(new Vector3(8, 0, 0));
      jest
        .spyOn(Image360Facade.prototype, 'collections', 'get')
        .mockReturnValue([makeCandidateCollection([current, near, far])]);

      // Click at (5, 0, 0): near is closer to the click point than far
      const result = helper.findBestNext360ImageEntity(new Vector3(5, 0, 0));
      expect(result?.image360).toBe(near);
    });

    test('ignores entities behind the current position', async () => {
      const current = await enterAt(new Vector3(0, 0, 0));
      const forward = makeCandidateEntityAt(new Vector3(5, 0, 0));
      const backward = makeCandidateEntityAt(new Vector3(-5, 0, 0));
      jest
        .spyOn(Image360Facade.prototype, 'collections', 'get')
        .mockReturnValue([makeCandidateCollection([current, forward, backward])]);

      const result = helper.findBestNext360ImageEntity(new Vector3(10, 0, 0));
      expect(result?.image360).toBe(forward);
    });
  });
});
