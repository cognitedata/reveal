/*!
 * Copyright 2025 Cognite AS
 */
import { Mock, It } from 'moq.ts';
import { Image360Facade } from './Image360Facade';

import { Image360CollectionFactory } from './collection/Image360CollectionFactory';
import { DataSourceType } from 'api-entry-points/core';
import { DefaultImage360Collection } from './collection/DefaultImage360Collection';
import { Matrix4, PerspectiveCamera, Vector2, Vector3 } from 'three';
import { Image360Entity } from './entity/Image360Entity';
import { Overlay3DIcon } from '@reveal/3d-overlays';
import { ClusterIntersectionData } from './icons/IconCollection';

import SeededRandom from 'random-seed';
import assert from 'assert';

type FacadeTestParams = {
  entityPosition?: Vector3;
  collectionTransformation?: Matrix4;
  clusterIntersectionResult?: ClusterIntersectionData;
  entityIcons?: Overlay3DIcon[];
};

describe(Image360Facade.name, () => {
  describe('intersect', () => {
    const ARBITRARY_POSITION = new Vector3(80, -223, 13);

    const ARBITRARY_TRANSFORMATION = new Matrix4()
      .makeTranslation(new Vector3(89, 1, -23))
      .multiply(new Matrix4().makeRotationAxis(new Vector3(0.1, 0.2, 0.3), 16));

    test('intersects entity properly from all angles+positions:', async () => {
      const facade = await createFacadeWithCollection();
      createPseudoRandomPositions('seed').forEach(position => {
        const camera = new PerspectiveCamera();
        camera.position.copy(position);
        camera.lookAt(new Vector3(0, 0, 0));
        camera.updateMatrixWorld();

        const result = facade.intersect(new Vector2(0, 0), camera);
        expect(result).toBeDefined();
      });
    });

    test('does not intersect entity when angle is off', async () => {
      const facade = await createFacadeWithCollection();
      createPseudoRandomPositions('seed').forEach(position => {
        const camera = new PerspectiveCamera();
        camera.position.copy(position);
        camera.lookAt(new Vector3(0, 0, 0));
        camera.rotateOnAxis(new Vector3(1, 0, 0), 1.5);
        camera.updateMatrixWorld();

        const result = facade.intersect(new Vector2(0, 0), camera);
        expect(result).toBeUndefined();
      });
    });

    test('intersects entity also when entity and collection has transform', async () => {
      const finalEntityPosition = ARBITRARY_POSITION.clone().applyMatrix4(ARBITRARY_TRANSFORMATION);

      const facade = await createFacadeWithCollection({
        entityPosition: ARBITRARY_POSITION,
        collectionTransformation: ARBITRARY_TRANSFORMATION
      });

      createPseudoRandomPositions('seed').forEach(position => {
        const camera = new PerspectiveCamera();
        camera.position.copy(position.clone().add(finalEntityPosition));
        camera.lookAt(finalEntityPosition);
        camera.updateMatrixWorld();

        const result = facade.intersect(new Vector2(0, 0), camera);
        expect(result).toBeDefined();
      });
    });

    test('does not intersect entity when angle is off also when entity and collection has transform', async () => {
      const finalEntityPosition = ARBITRARY_POSITION.clone().applyMatrix4(ARBITRARY_TRANSFORMATION);

      const facade = await createFacadeWithCollection({
        entityPosition: ARBITRARY_POSITION,
        collectionTransformation: ARBITRARY_TRANSFORMATION
      });

      createPseudoRandomPositions('seed').forEach(position => {
        const camera = new PerspectiveCamera();
        camera.position.copy(position.clone().add(finalEntityPosition));
        camera.lookAt(finalEntityPosition);
        camera.rotateOnAxis(new Vector3(1, 0, 0), 1.5);
        camera.updateMatrixWorld();

        const result = facade.intersect(new Vector2(0, 0), camera);
        expect(result).toBeUndefined();
      });
    });
  });

  describe('intersectCluster', () => {
    test('returns undefined when no clusters are hit', async () => {
      const facade = await createFacadeWithCollection({
        clusterIntersectionResult: undefined
      });

      const camera = new PerspectiveCamera();
      camera.position.set(0, 0, 10);
      camera.lookAt(new Vector3(0, 0, 0));
      camera.updateMatrixWorld();

      const result = facade.intersectCluster(new Vector2(0, 0), camera);
      expect(result).toBeUndefined();
    });

    test('returns cluster data when a cluster is hit', async () => {
      const clusterPosition = new Vector3(10, 5, 0);
      const clusterSize = 5;
      const mockIcon = createMockIcon(clusterPosition);
      const expectedCameraDistanceValue = 51.23;

      const facade = await createFacadeWithCollection({
        clusterIntersectionResult: {
          clusterPosition: clusterPosition.clone(),
          clusterSize,
          clusterIcons: [mockIcon],
          representativeIcon: mockIcon
        }
      });

      const camera = new PerspectiveCamera();
      camera.position.set(0, 0, 50);
      camera.lookAt(clusterPosition);
      camera.updateMatrixWorld();

      const result = facade.intersectCluster(new Vector2(0, 0), camera);

      assert(result);
      expect(result.clusterSize).toBe(clusterSize);
      expect(result.clusterPosition).toBeInstanceOf(Vector3);
      expect(result.distanceToCamera).toBeCloseTo(expectedCameraDistanceValue, 1);
    });

    test('applies collection transformation to cluster position', async () => {
      const modelClusterPosition = new Vector3(10, 0, 0);
      const transformation = new Matrix4().makeTranslation(100, 0, 0);
      const expectedWorldPosition = modelClusterPosition.clone().applyMatrix4(transformation);
      const mockIcon = createMockIcon(modelClusterPosition);

      const facade = await createFacadeWithCollection({
        clusterIntersectionResult: {
          clusterPosition: modelClusterPosition.clone(),
          clusterSize: 3,
          clusterIcons: [mockIcon],
          representativeIcon: mockIcon
        },
        collectionTransformation: transformation
      });

      const camera = new PerspectiveCamera();
      camera.position.set(0, 0, 50);
      camera.lookAt(expectedWorldPosition);
      camera.updateMatrixWorld();

      const result = facade.intersectCluster(new Vector2(0, 0), camera);

      assert(result);
      expect(result.clusterPosition.x).toBeCloseTo(expectedWorldPosition.x, 1);
      expect(result.clusterPosition.y).toBeCloseTo(expectedWorldPosition.y, 1);
      expect(result.clusterPosition.z).toBeCloseTo(expectedWorldPosition.z, 1);
    });

    test('returns cluster entities matching the cluster icons', async () => {
      const icon1 = createMockIcon(new Vector3(0, 0, 0));
      const icon2 = createMockIcon(new Vector3(1, 0, 0));

      const facade = await createFacadeWithCollection({
        clusterIntersectionResult: {
          clusterPosition: new Vector3(0.5, 0, 0),
          clusterSize: 2,
          clusterIcons: [icon1, icon2],
          representativeIcon: icon1
        },
        entityIcons: [icon1, icon2]
      });

      const camera = new PerspectiveCamera();
      camera.position.set(0, 0, 10);
      camera.lookAt(new Vector3(0, 0, 0));
      camera.updateMatrixWorld();

      const result = facade.intersectCluster(new Vector2(0, 0), camera);

      assert(result);
      expect(result.clusterIcons.length).toBe(2);
    });
  });

  test('calls clearHoveredCluster on all collections', async () => {
    let clearHoveredClusterCalled = false;

    const facade = await createFacadeWithCollection({
      entityIcons: [],
      onClearHoveredCluster: () => {
        clearHoveredClusterCalled = true;
      }
    });

    facade.clearHoveredClusters();
    expect(clearHoveredClusterCalled).toBe(true);
  });

  test('intersect updates cluster hover state', async () => {
    let intersectClusterCalled = false;
    let clearHoveredClusterCalled = false;

    const facade = await createFacadeWithCollection({
      onIntersectCluster: () => {
        intersectClusterCalled = true;
      },
      onClearHoveredCluster: () => {
        clearHoveredClusterCalled = true;
      }
    });

    const camera = new PerspectiveCamera();
    camera.position.set(0, 0, 10);
    camera.lookAt(new Vector3(0, 0, 0));
    camera.updateMatrixWorld();

    facade.intersect(new Vector2(0, 0), camera);

    expect(clearHoveredClusterCalled).toBe(true);
    expect(intersectClusterCalled).toBe(true);
  });

  test('intersect sets hovered cluster icon when cluster is hit', async () => {
    const clusterPosition = new Vector3(5, 5, 0);
    const mockIcon = createMockIcon(clusterPosition);
    let setHoveredClusterIconCalled = false;
    let hoveredIcon: Overlay3DIcon | undefined;

    const facade = await createFacadeWithCollection({
      clusterIntersectionResult: {
        clusterPosition: clusterPosition.clone(),
        clusterSize: 3,
        clusterIcons: [mockIcon],
        representativeIcon: mockIcon
      },
      onSetHoveredClusterIcon: icon => {
        setHoveredClusterIconCalled = true;
        hoveredIcon = icon;
      }
    });

    const camera = new PerspectiveCamera();
    camera.position.set(0, 0, 10);
    camera.lookAt(clusterPosition);
    camera.updateMatrixWorld();

    facade.intersect(new Vector2(0, 0), camera);

    expect(setHoveredClusterIconCalled).toBe(true);
    expect(hoveredIcon).toBe(mockIcon);
  });
});

function createPseudoRandomPositions(seed: string, count = 100): Array<Vector3> {
  const random = SeededRandom.create(seed);

  return new Array(count).map(() => {
    const theta = random.floatBetween(-Math.PI, Math.PI);
    const phi = random.floatBetween(-Math.PI / 2, Math.PI / 2);
    const radius = random.floatBetween(1.5, 200);

    return new Vector3(
      Math.sin(theta) * Math.cos(phi) * radius,
      Math.sin(phi) * radius,
      Math.cos(theta) * Math.cos(phi) * radius
    );
  });
}

function createMockIcon(position: Vector3): Overlay3DIcon {
  return new Mock<Overlay3DIcon>()
    .setup(p => p.getPosition())
    .returns(position)
    .object();
}

function createMockEntity(icon: Overlay3DIcon): Image360Entity<DataSourceType> {
  return new Mock<Image360Entity<DataSourceType>>()
    .setup(p => p.icon)
    .returns(icon)
    .setup(p => p.image360Visualization.visible)
    .returns(false)
    .object();
}

async function createFacadeWithCollection(
  params?: FacadeTestParams & {
    onIntersectCluster?: () => void;
    onClearHoveredCluster?: () => void;
    onSetHoveredClusterIcon?: (icon: Overlay3DIcon) => void;
  }
): Promise<Image360Facade<DataSourceType>> {
  // Create entities from entityIcons or create a default entity at entityPosition
  const mockEntities = params?.entityIcons
    ? params.entityIcons.map(icon => createMockEntity(icon))
    : [
        createMockEntity(
          new Overlay3DIcon(
            {
              position: params?.entityPosition ?? new Vector3(0, 0, 0),
              minPixelSize: 10,
              maxPixelSize: 80,
              iconRadius: 0.1
            },
            {}
          )
        )
      ];

  // Build mock collection with cluster support
  let mockCollectionBuilder = new Mock<DefaultImage360Collection<DataSourceType>>()
    .setup(p => p.getModelTransformation(It.IsAny()))
    .callback(({ args }) => args[0].copy(params?.collectionTransformation ?? new Matrix4()))
    .setup(p => p.image360Entities)
    .returns(mockEntities);

  // Setup intersectCluster with optional callback
  if (params?.onIntersectCluster) {
    mockCollectionBuilder = mockCollectionBuilder
      .setup(p => p.intersectCluster(It.IsAny()))
      .callback(() => {
        params.onIntersectCluster!();
        return params?.clusterIntersectionResult;
      });
  } else {
    mockCollectionBuilder = mockCollectionBuilder
      .setup(p => p.intersectCluster(It.IsAny()))
      .returns(params?.clusterIntersectionResult);
  }

  // Setup clearHoveredCluster with optional callback
  if (params?.onClearHoveredCluster) {
    mockCollectionBuilder = mockCollectionBuilder
      .setup(p => p.clearHoveredCluster())
      .callback(() => {
        params.onClearHoveredCluster!();
      });
  } else {
    mockCollectionBuilder = mockCollectionBuilder.setup(p => p.clearHoveredCluster()).returns(undefined);
  }

  // Setup getEntitiesFromIcons to return entities matching the given icons
  mockCollectionBuilder = mockCollectionBuilder
    .setup(p => p.setHoveredClusterIcon(It.IsAny()))
    .callback(({ args }) => {
      params?.onSetHoveredClusterIcon?.(args[0] as Overlay3DIcon);
    })
    .setup(p => p.getEntitiesFromIcons(It.IsAny()))
    .callback(({ args }) => {
      const icons = args[0] as Overlay3DIcon[];
      const iconSet = new Set(icons);
      return mockEntities.filter(entity => iconSet.has(entity.icon));
    });

  const mockCollection = mockCollectionBuilder.object();

  const facade = new Image360Facade(
    new Mock<Image360CollectionFactory>()
      .setup(p => p.create(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()))
      .returnsAsync(mockCollection)
      .object()
  );

  await facade.create({ siteId: 'siteId' });

  return facade;
}
