/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudFactory } from './PointCloudFactory';

import { CogniteClientPlayground } from '@cognite/sdk-playground';

import { Mock } from 'moq.ts';
import { PointCloudMetadata } from './PointCloudMetadata';
import { Potree, PointCloudOctree, PointCloudMaterial } from './potree-three-loader';

describe(PointCloudFactory.name, () => {
  test('contains right annotation IDs for annotations provided by SDK', async () => {
    const sdkPlaygroundMock = new Mock<CogniteClientPlayground>()
      .setup(p => p.annotations)
      .returns(
        new Mock<CogniteClientPlayground['annotations']>()
          .setup(a => a.list)
          .returns(() => {
            return Promise.resolve({
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
            }) as any;
          })
          .object()
      );

    const expectedIds = [123, 124];

    const potreeMock = new Mock<Potree>().
      setup(p => p.loadPointCloud)
      .returns(() => Promise.resolve(new Mock<PointCloudOctree>()
        .setup(p => p.material)
        .returns(new Mock<PointCloudMaterial>().object())
      .object()));

    const factory = new PointCloudFactory(potreeMock.object(), sdkPlaygroundMock.object());

    const model = await factory.createModel({ revealInternalId: Symbol() }, {
      modelBaseUrl: 'dummy-url'
    } as PointCloudMetadata);

    const gottenIds = model.stylableObjects.map(obj => obj.annotationId);

    expect(gottenIds.length).toEqual(expectedIds.length);
    expect(gottenIds).toContainAllValues(expectedIds);
  });
});
