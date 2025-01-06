/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient, FileInfo } from '@cognite/sdk';
import { Cdm360ImageDescriptorProvider } from './Cdm360ImageDescriptorProvider';
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
            cdf_cdm: {
              'Cognite360ImageCollection/v1': {
                name: 'Test Collection'
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
            cdf_cdm: {
              'Cognite360Image/v1': {
                top: {
                  externalId: 'test_image_3_Top',
                  space: 'test_space'
                },
                back: {
                  externalId: 'test_image_3_Back',
                  space: 'test_space'
                },
                left: {
                  externalId: 'test_image_3_Left',
                  space: 'test_space'
                },
                front: {
                  externalId: 'test_image_3_Front',
                  space: 'test_space'
                },
                right: {
                  externalId: 'test_image_3_Right',
                  space: 'test_space'
                },
                bottom: {
                  externalId: 'test_image_3_Bottom',
                  space: 'test_space'
                },
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
            cdf_cdm: {
              'Cognite360Image/v1': {
                top: {
                  externalId: 'test_image_3_Top',
                  space: 'test_space'
                },
                back: {
                  externalId: 'test_image_3_Back',
                  space: 'test_space'
                },
                left: {
                  externalId: 'test_image_3_Left',
                  space: 'test_space'
                },
                front: {
                  externalId: 'test_image_3_Front',
                  space: 'test_space'
                },
                right: {
                  externalId: 'test_image_3_Right',
                  space: 'test_space'
                },
                bottom: {
                  externalId: 'test_image_3_Bottom',
                  space: 'test_space'
                },
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
            cdf_cdm: {
              'Cognite360Image/v1': {
                top: {
                  externalId: 'test_image_3_Top',
                  space: 'test_space'
                },
                back: {
                  externalId: 'test_image_3_Back',
                  space: 'test_space'
                },
                left: {
                  externalId: 'test_image_3_Left',
                  space: 'test_space'
                },
                front: {
                  externalId: 'test_image_3_Front',
                  space: 'test_space'
                },
                right: {
                  externalId: 'test_image_3_Right',
                  space: 'test_space'
                },
                bottom: {
                  externalId: 'test_image_3_Bottom',
                  space: 'test_space'
                },
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

describe(Cdm360ImageDescriptorProvider.name, () => {
  test('MyTest', async () => {
    const sdkMock = new Mock<CogniteClient>()
      .setup(instance =>
        instance.post(
          It.Is((path: string) => path.includes('query')),
          It.IsAny()
        )
      )
      .returns(Promise.resolve(mock))
      .setup(instance =>
        instance.post(
          It.Is((path: string) => path.includes('files')),
          It.IsAny()
        )
      )
      .returns(
        Promise.resolve({
          data: {
            items: mock.data.items.images
              .map((_, n) => Array.from(Array(6).keys()).map(_ => ({ id: n, mimeType: 'image/jpeg' }) as FileInfo))
              .flatMap(p => p)
          },
          headers: {},
          status: 200
        })
      )
      .setup(instance => instance.getBaseUrl())
      .returns('https://example.com');

    const provider = new Cdm360ImageDescriptorProvider(sdkMock.object());

    const descriptors = await provider.get360ImageDescriptors(
      {
        source: 'cdm',
        space: 'christjt-test-system-360',
        image360CollectionExternalId: 'c_RC_2'
      },
      true
    );

    expect(descriptors.length).toBe(3);
  });
});
