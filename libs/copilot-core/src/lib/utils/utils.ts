import type { CogniteClient } from '@cognite/sdk/dist/src';

import type {
  embeddingResponse,
  embeddingResponseAda,
  queryResponse,
} from './types';

// Convert external id to id
export const getAssetByExternalId = async (
  externalId: string,
  sdk: CogniteClient
) => {
  const assets = await sdk.assets.retrieve([{ externalId: externalId }]);
  return assets[0].id;
};

// Calls either the vectorstore or gpt endpoint to embed a text chunk, based on the model parameter
const embedText = async (
  query: string,
  sdk: CogniteClient,
  model: string = 'ada' || 'vectorstore'
) => {
  const endpoint =
    model === 'ada'
      ? `/api/v1/projects/${sdk.project}/context/gpt/embeddings`
      : `/api/v1/projects/${sdk.project}/vectorstore/embedding`;

  const data =
    model === 'ada'
      ? { input: query, model: 'text-embedding-ada-002' }
      : { items: [{ text: query }] };

  const response = await sdk.post(endpoint, { data });

  if (response.status !== 200) {
    throw new Error(
      `Embedding query failed with status ${response.status}: ${response.data}`
    );
  }

  return response.data;
};

// Calls vectorstore to run a similarity search against documents in namespace related to assetID
export const retrieveContext = async (
  query: string,
  assetID: string,
  sdk: CogniteClient,
  model: string = 'ada' || 'vectorstore'
) => {
  const response = await sdk.post(
    `/api/v1/projects/${sdk.project}/vectorstore/query`,
    {
      data: {
        namespace: assetID,
        text: query,
        values:
          model === 'ada'
            ? ((await embedText(query, sdk, model)) as embeddingResponseAda)
                .data[0].embedding
            : ((await embedText(query, sdk, model)) as embeddingResponse)
                .items[0].values,
      },
    }
  );

  if (response.status !== 200) {
    throw new Error(
      `Context retrieval failed with status ${response.status}: ${response.data}`
    );
  }

  return response.data as queryResponse;
};

export const retrieveAsset = async (externalId: string, sdk: CogniteClient) => {
  return await sdk.assets.retrieve([{ externalId: externalId }]);
};
