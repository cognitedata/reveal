/*!
 * Copyright 2022 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

import { Mock } from 'moq.ts';
import { Potree, PointCloudOctree, PointCloudMaterial } from '../potree-three-loader';
import { ShapeType } from './shapes/IShape';
import { CompositeShape } from './shapes/CompositeShape';
import { CdfAnnotationProvider } from './CdfAnnotationProvider';
import { CdfModelIdentifier } from '@reveal/data-providers';

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

describe(CdfAnnotationProvider.name, () => {
  let annotationProvider: CdfAnnotationProvider;

  beforeEach(async () => {
    annotationProvider = new CdfAnnotationProvider(sdkMock.object());
  });

  test('contains right annotation IDs for annotations provided by SDK', async () => {
    const expectedIds = [123, 124];

    const gottenIds = (await annotationProvider.getAnnotations(new CdfModelIdentifier(123, 456))).annotations.map(
      obj => obj.annotationId
    );

    expect(gottenIds.length).toEqual(expectedIds.length);
    expect(gottenIds).toContainAllValues(expectedIds);
  });

  test('contains right geometry types for annotations provided by SDK', async () => {
    const shapes = (await annotationProvider.getAnnotations(new CdfModelIdentifier(123, 456))).annotations.map(
      obj => obj.stylableObject.shape
    );

    expect((shapes[0] as CompositeShape).innerShapes[0].shapeType).toEqual(ShapeType.Cylinder);
    expect((shapes[1] as CompositeShape).innerShapes[0].shapeType).toEqual(ShapeType.Box);
  });
});
