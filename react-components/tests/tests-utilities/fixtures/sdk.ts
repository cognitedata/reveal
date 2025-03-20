import { Mock } from 'moq.ts';
import {
  type AssetsAPI,
  type CogniteClient,
  type HttpResponse,
  type HttpRequestOptions
} from '@cognite/sdk';
import { vi } from 'vitest';
import { type AssetProperties } from '../../../src/data-providers/core-dm-provider/utils/filters';
import {
  type DmsUniqueIdentifier,
  type ExternalIdsResultList,
  type NodeItem
} from '../../../src/data-providers/FdmSDK';

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

export const postMock = vi.fn<
  (
    path: string,
    options?: HttpRequestOptions
  ) => Promise<HttpResponse<ExternalIdsResultList<AssetProperties>>>
>(async (_path, options) => {
  const assetRef = (options?.data as { items: DmsUniqueIdentifier[] | undefined } | undefined)
    ?.items?.[0];
  if (assetRef === undefined) {
    throw Error('Did not find asset ref in post body');
  }

  const nodeItem: NodeItem<AssetProperties> = {
    instanceType: 'node',
    version: 0,
    space: assetRef.space,
    externalId: assetRef.externalId,
    createdTime: 123456,
    lastUpdatedTime: 987654,
    properties: {
      cdf_cdm: {
        'CogniteAsset/v1': {
          name: 'asset-1',
          object3D: {
            externalId: 'object3d-external-id-1',
            space: 'object3d-space-1'
          },
          description: 'asset-1'
        }
      }
    }
  };

  const response: HttpResponse<ExternalIdsResultList<AssetProperties>> = {
    data: {
      items: [nodeItem],
      typing: {}
    },
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
  .returns(postMock as <T>(path: string, options?: HttpRequestOptions) => Promise<HttpResponse<T>>)
  .setup((p) => p.models3D.retrieve)
  .returns(async () => ({ name: 'Model Name', id: 1, createdTime: new Date() }))
  .object();
