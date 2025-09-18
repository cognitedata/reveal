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

import SeededRandom from 'random-seed';

describe(Image360Facade.name, () => {
  describe('intersect', () => {
    const ARBITRARY_POSITION = new Vector3(80, -223, 13);

    const ARBITRARY_TRANSFORMATION = new Matrix4()
      .makeTranslation(new Vector3(89, 1, -23))
      .multiply(new Matrix4().makeRotationAxis(new Vector3(0.1, 0.2, 0.3), 16));

    test('intersects entity properly from all angles+positions:', () => {
      const facade = createFacadeWithCollection();
      createPseudoRandomPositions('seed').forEach(position => {
        const camera = new PerspectiveCamera();
        camera.position.copy(position);
        camera.lookAt(new Vector3(0, 0, 0));
        camera.updateMatrixWorld();

        const result = facade.intersect(new Vector2(0, 0), camera);
        expect(result).toBeDefined();
      });
    });

    test('does not intersect entity when angle is off', () => {
      const facade = createFacadeWithCollection();
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

    test('intersects entity also when entity and collection has transform', () => {
      const finalEntityPosition = ARBITRARY_POSITION.clone().applyMatrix4(ARBITRARY_TRANSFORMATION);

      const facade = createFacadeWithCollection({
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

    test('does not intersect entity when angle is off also when entity and collection has transform', () => {
      const finalEntityPosition = ARBITRARY_POSITION.clone().applyMatrix4(ARBITRARY_TRANSFORMATION);

      const facade = createFacadeWithCollection({
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

function createFacadeWithCollection(params?: {
  entityPosition?: Vector3;
  collectionTransformation?: Matrix4;
}): Image360Facade<DataSourceType> {
  const mockEntity = new Mock<Image360Entity<DataSourceType>>()
    .setup(p => p.icon)
    .returns(
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
    .setup(p => p.image360Visualization.visible)
    .returns(false)
    .object();

  const mockCollection = new Mock<DefaultImage360Collection<DataSourceType>>()
    .setup(p => p.getModelTransformation(It.IsAny()))
    .callback(({ args }) => args[0].copy(params?.collectionTransformation ?? new Matrix4()))
    .setup(p => p.image360Entities)
    .returns([mockEntity])
    .object();

  const facade = new Image360Facade(
    new Mock<Image360CollectionFactory>()
      .setup(p => p.create(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()))
      .returnsAsync(mockCollection)
      .object()
  );

  facade.create({ siteId: 'siteId' });

  return facade;
}
