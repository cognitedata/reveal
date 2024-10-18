/*!
 * Copyright 2022 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

import { Mock } from 'moq.ts';
import { CompositeShape, Cylinder, Box } from '@reveal/utilities';
import { CdfPointCloudStylableObjectProvider } from './CdfPointCloudStylableObjectProvider';
import { CdfModelIdentifier } from '../model-identifiers/CdfModelIdentifier';

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

describe(CdfPointCloudStylableObjectProvider.name, () => {
  let annotationProvider: CdfPointCloudStylableObjectProvider;

  beforeEach(async () => {
    annotationProvider = new CdfPointCloudStylableObjectProvider(sdkMock.object());
  });

  test('contains right annotation IDs for annotations provided by SDK', async () => {
    const expectedIds = [123, 124];

    const gottenIds = (await annotationProvider.getPointCloudObjects(new CdfModelIdentifier(123, 456))).map(
      (obj: any) => obj.annotationId
    );

    expect(gottenIds.length).toEqual(expectedIds.length);
    expect(gottenIds).toContainAllValues(expectedIds);
  });

  test('contains right geometry types for annotations provided by SDK', async () => {
    const shapes = (await annotationProvider.getPointCloudObjects(new CdfModelIdentifier(123, 456))).map(
      obj => obj.stylableObject.shape
    );

    expect((shapes[0] as CompositeShape).innerShapes[0]).toBeInstanceOf(Cylinder);
    expect((shapes[1] as CompositeShape).innerShapes[0]).toBeInstanceOf(Box);
  });
});
