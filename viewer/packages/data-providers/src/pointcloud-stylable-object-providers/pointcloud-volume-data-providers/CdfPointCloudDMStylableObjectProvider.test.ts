/*!
 * Copyright 2024 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { It, Mock } from 'moq.ts';
import { CompositeShape, Cylinder, Box } from '@reveal/utilities';
import { CdfPointCloudDMStylableObjectProvider } from './CdfPointCloudDMStylableObjectProvider';
import { DMModelIdentifier } from '../../model-identifiers/DMModelIdentifier';

const mock = {
  headers: {
    'access-control-allow-credentials': 'false',
    'access-control-allow-headers':
      'accept,accept-language,content-type,content-language,content-range,origin,authorization,api-key,auth-ticket,cdf-version,cdf-experiments,env,x-cdp-app,x-cdp-clienttag,x-cdp-sdk,x-ms-blob-content-type,x-upload-content-type,x-user-agent',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD',
    'access-control-allow-origin': '*',
    'access-control-expose-headers': 'x-request-id',
    'access-control-max-age': '7200',
    connection: 'close',
    'content-encoding': 'gzip',
    'content-length': '6542',
    'content-type': 'application/json',
    date: 'Thu, 16 Nov 2023 14:46:45 GMT',
    server: 'envoy',
    'strict-transport-security': 'max-age=31536000',
    vary: 'Accept-Encoding',
    'x-envoy-upstream-service-time': '143',
    'x-request-id': '87518dc6-0c61-9ef0-9588-94f61ab5a450'
  },
  status: 200,
  data: {
    items: {
      pointCloudVolumes: [
        {
          name: 'node',
          description: 'test point cloud volume 1',
          space: 'test_space',
          externalId: 'test_pointcloudvolume_1',
          createdTime: 0,
          lastUpdatedTime: 0,
          properties: {
            cdf_cdm: {
              'CognitePointCloudVolume/v1': {
                volume: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                volumeType: 'Box',
                object3D: { externalId: 'obj3d0', space: 'objSpace' }
              }
            }
          }
        },
        {
          name: 'node',
          description: 'test point cloud volume 2',
          space: 'test_space',
          externalId: 'test_pointcloudvolume_2',
          createdTime: 0,
          lastUpdatedTime: 0,
          properties: {
            cdf_cdm: {
              'CognitePointCloudVolume/v1': {
                volume: [-0.03, 0.1, -1000, -0.03, 0.1, 1000, 0.04],
                volumeType: 'Cylinder',
                object3D: { externalId: 'obj3d1', space: 'objSpace' }
              }
            }
          }
        }
      ],
      assets: [
        {
          instanceType: 'node',
          version: 1,
          space: 'test_space',
          externalId: 'test_asset_1',
          createdTime: 0,
          lastUpdatedTime: 0,
          properties: {
            cdf_cdm: {
              'CogniteAsset/v1': {
                object3D: { externalId: 'obj3d0', space: 'objSpace' }
              }
            }
          }
        },
        {
          instanceType: 'node',
          version: 1,
          space: 'test_space',
          externalId: 'test_asset_2',
          createdTime: 0,
          lastUpdatedTime: 0,
          properties: {
            cdf_cdm: {
              'CogniteAsset/v1': {
                object3D: { externalId: 'obj3d1', space: 'objSpace' }
              }
            }
          }
        }
      ]
    }
  }
};

const dummyDMAnnotationsResponse = {
  items: [
    {
      volumeRef: { externalId: 'test_pointcloudvolume_1', space: 'test_space' },
      assetRef: { externalId: 'test_asset_1', space: 'test_space' },
      data: {
        region: [{ cylinder: { centerA: [-0.03, 0.1, -1000], centerB: [-0.03, 0.1, 1000], radius: 0.04 } }]
      }
    },
    {
      volumeRef: { externalId: 'test_pointcloudvolume_2', space: 'test_space' },
      assetRef: { externalId: 'test_asset_2', space: 'test_space' },
      data: {
        region: [{ box: { matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] } }]
      }
    }
  ]
};

const sdkMock = new Mock<CogniteClient>()
  .setup(instance => instance.post(It.IsAny(), It.IsAny()))
  .returns(Promise.resolve(mock))
  .setup(instance => instance.getBaseUrl())
  .returns('https://example.com');

const modelIdentifierInput = {
  revisionSpace: 'some space',
  revisionExternalId: 'some external id',
  modelId: 123,
  revisionId: 456
};

describe(CdfPointCloudDMStylableObjectProvider.name, () => {
  let dmAnnotationProvider: CdfPointCloudDMStylableObjectProvider;

  beforeEach(async () => {
    dmAnnotationProvider = new CdfPointCloudDMStylableObjectProvider(sdkMock.object());
  });

  test('contains right point cloud volume references provided by SDK', async () => {
    const expectedRefs = [dummyDMAnnotationsResponse.items[0].volumeRef, dummyDMAnnotationsResponse.items[1].volumeRef];
    const gottenRefs = (
      await dmAnnotationProvider.getPointCloudObjects(new DMModelIdentifier(modelIdentifierInput))
    ).map((obj: any) => obj.volumeInstanceRef);

    expect(gottenRefs.length).toEqual(dummyDMAnnotationsResponse.items.length);
    expect(gottenRefs).toContainAllValues(expectedRefs);
  });

  test('contains right geometry types for point cloud volumes provided by SDK', async () => {
    const shapes = (await dmAnnotationProvider.getPointCloudObjects(new DMModelIdentifier(modelIdentifierInput))).map(
      obj => obj.stylableObject.shape
    );

    expect((shapes[0] as CompositeShape).innerShapes[0]).toBeInstanceOf(Box);
    expect((shapes[1] as CompositeShape).innerShapes[0]).toBeInstanceOf(Cylinder);
  });

  test('contains right asset references provided by SDK', async () => {
    const expectedAssets = [dummyDMAnnotationsResponse.items[0].assetRef, dummyDMAnnotationsResponse.items[1].assetRef];
    const gottenAssets = (
      await dmAnnotationProvider.getPointCloudObjects(new DMModelIdentifier(modelIdentifierInput))
    ).map((obj: any) => obj.assetRef);

    expect(gottenAssets.length).toEqual(expectedAssets.length);
    expect(gottenAssets).toContainAllValues(expectedAssets);
  });

  test('handles empty point cloud volumes gracefully', async () => {
    const emptyMock = { ...mock, data: { items: { pointCloudVolumes: [], assets: [] } } };
    sdkMock.setup(instance => instance.post(It.IsAny(), It.IsAny())).returns(Promise.resolve(emptyMock));

    const gottenRefs = await dmAnnotationProvider.getPointCloudObjects(new DMModelIdentifier(modelIdentifierInput));

    expect(gottenRefs.length).toEqual(0);
  });

  test('handles missing revisionSpace gracefully', async () => {
    const gottenRefs = await dmAnnotationProvider.getPointCloudObjects(new DMModelIdentifier(modelIdentifierInput));

    expect(gottenRefs.length).toEqual(0);
  });
});
