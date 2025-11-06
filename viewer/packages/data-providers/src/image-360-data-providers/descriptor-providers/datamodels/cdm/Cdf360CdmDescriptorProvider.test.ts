/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient, FileInfo, HttpResponse } from '@cognite/sdk';
import { Cdf360CdmDescriptorProvider } from './Cdf360CdmDescriptorProvider';
import { It, Mock } from 'moq.ts';
import { mockCdf360CdmDescriptorProviderResponse } from '../../../../../../../test-utilities/src/fixtures/dmsResponses/mockCdf360CdmDescriptorProviderResponse';

describe(Cdf360CdmDescriptorProvider.name, () => {
  test('should fetch 360 image descriptors with batching', async () => {
    const sdkMock = createMockClient();
    const provider = new Cdf360CdmDescriptorProvider(sdkMock.object());

    const descriptors = await provider.get360ImageDescriptors(
      {
        source: 'cdm',
        space: 'test_space',
        image360CollectionExternalId: 'test_collection'
      },
      true
    );

    expect(descriptors.length).toBe(3);
    expect(descriptors[0].collectionId).toBe('test_collection');
    expect(descriptors[0].imageRevisions).toHaveLength(1);
  });

  test('two providers with separate batch loaders can fetch descriptors', async () => {
    const sdkMock = createMockClient();

    // Create two providers - each will have its own batch loader by default
    const provider1 = new Cdf360CdmDescriptorProvider(sdkMock.object());
    const provider2 = new Cdf360CdmDescriptorProvider(sdkMock.object());

    // Request from both providers simultaneously
    const [descriptors1, descriptors2] = await Promise.all([
      provider1.get360ImageDescriptors(
        {
          source: 'cdm',
          space: 'test_space',
          image360CollectionExternalId: 'test_collection'
        },
        true
      ),
      provider2.get360ImageDescriptors(
        {
          source: 'cdm',
          space: 'test_space',
          image360CollectionExternalId: 'test_collection'
        },
        true
      )
    ]);

    expect(descriptors1.length).toBe(3);
    expect(descriptors2.length).toBe(3);
  });

  test('should handle empty collections gracefully with batching', async () => {
    const emptyQueryResponse = {
      ...mockCdf360CdmDescriptorProviderResponse,
      data: {
        items: {
          image_collections: mockCdf360CdmDescriptorProviderResponse.data.items.image_collection,
          images: [],
          stations: []
        }
      }
    };

    const sdkMock = createMockClient(emptyQueryResponse, undefined);
    const provider = new Cdf360CdmDescriptorProvider(sdkMock.object());

    const descriptors = await provider.get360ImageDescriptors(
      {
        source: 'cdm',
        space: 'christjt-test-system-360',
        image360CollectionExternalId: 'c_RC_2'
      },
      true
    );

    expect(descriptors.length).toBe(0);
  });

  // Helper to create mock CogniteClient with query and files responses
  function createMockClient(queryResponse?: unknown, filesResponse = createMockFiles()) {
    const defaultQueryResponse = {
      ...mockCdf360CdmDescriptorProviderResponse,
      data: {
        items: {
          image_collections: mockCdf360CdmDescriptorProviderResponse.data.items.image_collection,
          images: mockCdf360CdmDescriptorProviderResponse.data.items.images,
          stations: mockCdf360CdmDescriptorProviderResponse.data.items.stations
        }
      }
    };

    const actualQueryResponse = queryResponse || defaultQueryResponse;

    const filesMock = new Mock<CogniteClient['files']>()
      .setup(instance => instance.retrieve(It.IsAny()))
      .returns(Promise.resolve(filesResponse.data.items));

    return new Mock<CogniteClient>()
      .setup(instance =>
        instance.post(
          It.Is((path: string) => path.includes('query')),
          It.IsAny()
        )
      )
      .returns(Promise.resolve(actualQueryResponse) as Promise<HttpResponse<unknown>>)
      .setup(instance => instance.files)
      .returns(filesMock.object())
      .setup(instance => instance.getBaseUrl())
      .returns('https://example.com')
      .setup(instance => instance.project)
      .returns('test-project');
  }

  function createMockFiles(): { data: { items: FileInfo[] } } {
    return {
      data: {
        items: mockCdf360CdmDescriptorProviderResponse.data.items.images
          .map((_, n) =>
            Array.from(Array(6).keys()).map(
              idx =>
                ({
                  id: n * 10 + idx,
                  mimeType: 'image/jpeg',
                  instanceId: {
                    externalId: `test_image_3_${['Top', 'Back', 'Left', 'Front', 'Right', 'Bottom'][idx]}`,
                    space: 'test_space'
                  }
                }) as FileInfo
            )
          )
          .flatMap(p => p)
      }
    };
  }
});
