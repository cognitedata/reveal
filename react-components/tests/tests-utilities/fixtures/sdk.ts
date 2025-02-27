import { Mock } from 'moq.ts';
import {
  type Asset as BaseAsset,
  type AssetsAPI,
  type CogniteClient,
  type HttpResponse,
  type HttpRequestOptions
} from '@cognite/sdk';
import { vi } from 'vitest';

type Asset = {
  properties?: {
    cdf_cdm: {
      'cognite-asset-view'?: {
        id: number;
        name: string;
        rootId: number;
        lastUpdatedTime: Date;
        createdTime: Date;
      };
    };
  };
} & BaseAsset;

export const retrieveMock = vi.fn<AssetsAPI['retrieve']>(async (assetIds) => {
  return await Promise.resolve(
    assetIds.map((assetId) => ({
      id: typeof assetId === 'number' ? assetId : Number(assetId),
      name: `asset-${typeof assetId === 'number' ? assetId : Number(assetId)}`,
      rootId: 0,
      lastUpdatedTime: new Date(),
      createdTime: new Date()
    }))
  );
});

export const postMock = vi.fn<() => Promise<HttpResponse<{ items: Asset[] }>>>(async () => {
  const dmAssets: Asset[] = [
    {
      id: 1,
      name: 'asset-1',
      rootId: 0,
      lastUpdatedTime: new Date(),
      createdTime: new Date(),
      properties: {
        'core-dm': {
          'cognite-asset-view': {
            id: 1,
            name: 'asset-1',
            rootId: 0,
            lastUpdatedTime: new Date(),
            createdTime: new Date()
          }
        }
      }
    },
    {
      id: 2,
      name: 'asset-2',
      rootId: 0,
      lastUpdatedTime: new Date(),
      createdTime: new Date(),
      properties: {
        'core-dm': {
          'cognite-asset-view': {
            id: 2,
            name: 'asset-2',
            rootId: 0,
            lastUpdatedTime: new Date(),
            createdTime: new Date()
          }
        }
      }
    }
  ];

  const response: HttpResponse<{ items: Asset[] }> = {
    data: { items: dmAssets },
    status: 200,
    headers: {}
  };
  return response;
});

export const assetRetrieveMock = new Mock<AssetsAPI>()
  .setup((p) => p.retrieve)
  .returns(retrieveMock)
  .object();

export const sdkMock = new Mock<CogniteClient>()
  .setup((p) => p.getBaseUrl())
  .returns('https://api.cognitedata.com')
  .setup((p) => p.project)
  .returns('test-project')
  .setup((p) => p.assets)
  .returns(assetRetrieveMock)
  .setup((p) => p.post)
  .returns(
    postMock as unknown as <T = any>(
      path: string,
      options?: HttpRequestOptions
    ) => Promise<HttpResponse<T>>
  )
  .object();
