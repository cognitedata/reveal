/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient, FileInfo } from '@cognite/sdk';
import { Cdf360DataModelsDescriptorProvider } from './Cdf360DataModelsDescriptorProvider';
import { It, Mock } from 'moq.ts';

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
      image_collection: [
        {
          instanceType: 'node',
          version: 1,
          space: 'test_space',
          externalId: 'test_collection',
          createdTime: 0,
          lastUpdatedTime: 0,
          properties: {
            cdf_360_image_schema: {
              'Image360Collection/v1': {
                label: 'Test Collection'
              }
            }
          }
        }
      ],
      images: [
        {
          instanceType: 'node',
          version: 1,
          space: 'test_space',
          externalId: 'test_image_1',
          createdTime: 0,
          lastUpdatedTime: 0,
          properties: {
            cdf_360_image_schema: {
              'Image360/v1': {
                cubeMapTop: 'test_image_1_Top',
                cubeMapBack: 'test_image_1_Back',
                cubeMapLeft: 'test_image_1_Left',
                cubeMapFront: 'test_image_1_Front',
                cubeMapRight: 'test_image_1_Right',
                cubeMapBottom: 'test_image_1_Bottom',
                label: '',
                collection360: {
                  space: 'test_space',
                  externalId: 'test_collection'
                },
                scaleX: 1,
                scaleY: 1,
                scaleZ: 1,
                translationX: 0,
                translationY: 0,
                translationZ: 0,
                eulerRotationX: 0,
                eulerRotationY: 0,
                eulerRotationZ: 0
              }
            }
          }
        },
        {
          instanceType: 'node',
          version: 1,
          space: 'test_space',
          externalId: 'test_image_2',
          createdTime: 0,
          lastUpdatedTime: 0,
          properties: {
            cdf_360_image_schema: {
              'Image360/v1': {
                cubeMapTop: 'test_image_2_Top',
                cubeMapBack: 'test_image_2_Back',
                cubeMapLeft: 'test_image_2_Left',
                cubeMapFront: 'test_image_2_Front',
                cubeMapRight: 'test_image_2_Right',
                cubeMapBottom: 'test_image_2_Bottom',
                label: '',
                collection360: {
                  space: 'test_space',
                  externalId: 'test_collection'
                },
                scaleX: 1,
                scaleY: 1,
                scaleZ: 1,
                translationX: 1,
                translationY: 1,
                translationZ: 1,
                eulerRotationX: 1,
                eulerRotationY: 1,
                eulerRotationZ: 1
              }
            }
          }
        },
        {
          instanceType: 'node',
          version: 1,
          space: 'test_space',
          externalId: 'test_image_3',
          createdTime: 0,
          lastUpdatedTime: 0,
          properties: {
            cdf_360_image_schema: {
              'Image360/v1': {
                cubeMapTop: 'test_image_3_Top',
                cubeMapBack: 'test_image_3_Back',
                cubeMapLeft: 'test_image_3_Left',
                cubeMapFront: 'test_image_3_Front',
                cubeMapRight: 'test_image_3_Right',
                cubeMapBottom: 'test_image_3_Bottom',
                label: '',
                collection360: {
                  space: 'test_space',
                  externalId: 'test_collection'
                },
                scaleX: 1,
                scaleY: 1,
                scaleZ: 1,
                translationX: 3,
                translationY: 3,
                translationZ: 3,
                eulerRotationX: 3,
                eulerRotationY: 3,
                eulerRotationZ: 3
              }
            }
          }
        }
      ],
      stations: []
    }
  }
};

describe(Cdf360DataModelsDescriptorProvider.name, () => {
  test('MyTest', async () => {
    const sdkMock = new Mock<CogniteClient>()
      .setup(instance => instance.post(It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(mock))
      .setup(instance => instance.getBaseUrl())
      .returns('https://example.com')
      .setup(instance => instance.files.retrieve(It.IsAny()))
      .returns(
        Promise.resolve(
          mock.data.items.images
            .map((_, n) => Array.from(Array(6).keys()).map(_ => ({ id: n, mimeType: 'image/jpeg' }) as FileInfo))
            .flatMap(p => p)
        )
      );

    const provider = new Cdf360DataModelsDescriptorProvider(sdkMock.object());

    const descriptors = await provider.get360ImageDescriptors(
      {
        source: 'dm',
        space: 'christjt-test-system-360',
        image360CollectionExternalId: 'c_RC_2'
      },
      true
    );

    expect(descriptors.length).toBe(3);
  });
});
