import type { CogniteClient } from '@cognite/sdk/dist/src';

import type {
  embeddingResponse,
  embeddingResponseAda,
  queryResponse,
} from './types';

// Get asset document download urls from asset id
export const getAssetDocuments = async (
  assetId: number,
  sdk: CogniteClient
) => {
  const files_filter = await sdk.files.list({
    filter: { mimeType: 'application/pdf', assetIds: [assetId] },
  });

  const files: string[] = [];
  files_filter.items.forEach(async (file) => {
    const f = await getDownloadUrlFromId(file.id, sdk);
    files.push(f);
  });

  return files;
};

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
  console.log('Retrieving context for query: ' + query);

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

// Get download url from file id
const getDownloadUrlFromId = async (documentId: number, sdk: CogniteClient) => {
  const f = await sdk.files.getDownloadUrls([{ id: documentId }]);
  return f[0].downloadUrl;
};
