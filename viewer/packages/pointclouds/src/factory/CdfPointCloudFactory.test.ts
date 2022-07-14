/*!
 * Copyright 2022 Cognite AS
 */

import { CdfPointCloudFactory } from './CdfPointCloudFactory';

import { CogniteClient } from '@cognite/sdk';

import { Mock } from 'moq.ts';
import { PointCloudMetadata } from '../PointCloudMetadata';
import { Potree, PointCloudOctree, PointCloudMaterial } from '../potree-three-loader';
import { PotreeNodeWrapper } from '../PotreeNodeWrapper';

import * as THREE from 'three';

const dummyAnnotationsResponse = {
  items: [
    {
      id: 123,
      data: {
        region: [{ cylinder: { centerA: [-0.03, 0.1, -1000], centerB: [-0.03, 0.1, 1000], radius: 0.04 } }]
      }
    },
    {
      id: 124,
      data: {
        region: [{ box: { matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] } }]
      }
    }
  ]
};

const sdkMock = new Mock<CogniteClient>()
  .setup(p => p.annotations)
  .returns(
    new Mock<CogniteClient['annotations']>()
      .setup(a => a.list)
      .returns(() => {
        const promise = Promise.resolve(dummyAnnotationsResponse);

        Object.assign(promise, { autoPagingToArray: async (_arg: { limit: number }) => (await promise).items });
        return promise as any;
      })
      .object()
  );

const potreeMock = new Mock<Potree>()
  .setup(p => p.loadPointCloud)
  .returns(() =>
    Promise.resolve(
      new Mock<PointCloudOctree>()
        .setup(p => p.material)
        .returns(new Mock<PointCloudMaterial>().object())
        .object()
    )
  );

describe(CdfPointCloudFactory.name, () => {
  let factory: CdfPointCloudFactory;
  let model: PotreeNodeWrapper;

  beforeEach(async () => {
    factory = new CdfPointCloudFactory(potreeMock.object(), sdkMock.object());
    model = await factory.createModel({
      modelBaseUrl: 'dummy-url',
      modelIdentifier: { revealInternalId: Symbol() }
    } as PointCloudMetadata);
  });

  test('contains right annotation IDs for annotations provided by SDK', async () => {
    const expectedIds = [123, 124];

    const gottenIds = model.stylableObjects.map(obj => obj.annotationId);

    expect(gottenIds.length).toEqual(expectedIds.length);
    expect(gottenIds).toContainAllValues(expectedIds);
  });

  test('contains right geometries for annotations provided by SDK', async () => {
    const expectedContainedPoints: THREE.Vector3[] = [
      new THREE.Vector3(-0.03, 0.1, -500),
      new THREE.Vector3(0.4, -0.4, 0)
    ];
    const expectedUncontainedPoints: THREE.Vector3[] = [
      new THREE.Vector3(1, 1, 1),
      new THREE.Vector3(300, 300, 300)
    ];

    const shapes = model.stylableObjects.map(obj => obj.stylableObject.shape);

    function containedInAnyShape(p: THREE.Vector3): boolean {
      let contained = false;
      for (const shape of shapes) {
        contained ||= shape.containsPoint(p);
      }
      return contained;
    }

    for (const expectedContainedPoint of expectedContainedPoints) {
      expect(containedInAnyShape(expectedContainedPoint)).toBeTrue();
    }

    for (const expectedUncontainedPoint of expectedUncontainedPoints) {
      expect(containedInAnyShape(expectedUncontainedPoint)).toBeFalse();
    }
  });
});
