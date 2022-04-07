import type { CogniteClient } from '@cognite/sdk';

import {
  ParsedDocument,
  LineReview,
  DocumentsForLine,
  LineReviewState,
} from './types';

export const getDocumentUrlByExternalId =
  (client: CogniteClient) =>
  async (externalId: string): Promise<string> => {
    try {
      const response = await client.files.getDownloadUrls([{ externalId }]);
      return response[0].downloadUrl;
    } catch (error) {
      throw new Error('Getting document url failed');
    }
  };

const getJsonByExternalId = async <T = unknown>(
  client: CogniteClient,
  externalId: string
): Promise<T> => {
  const url = await getDocumentUrlByExternalId(client)(externalId);
  const response = await fetch(url);
  const json = await response.json();
  return json;
};

const saveJsonByExternalId = async <T = unknown>(
  client: CogniteClient,
  externalId: string,
  data: T
): Promise<void> => {
  try {
    await client.files.upload(
      { externalId, name: externalId, mimeType: 'application/json' },
      JSON.stringify(data),
      true
    );
  } catch (error) {
    console.log('Throws errors unnecessarily');
  }
};

const VERSION = '0.0.10';
const LINE_REVIEWS_ENTRY_POINT = `LINE_REVIEWS_V${VERSION}.json`;
export const getLineReviews = async (client: CogniteClient) => {
  const lineReviewsEntryPointResponse = await getJsonByExternalId<{
    lineReviews: LineReview[];
  }>(client, LINE_REVIEWS_ENTRY_POINT);

  return lineReviewsEntryPointResponse.lineReviews;
};

export const saveLineReviews = async (
  client: CogniteClient,
  lineReviews: LineReview[]
) => {
  return saveJsonByExternalId(client, LINE_REVIEWS_ENTRY_POINT, {
    externalId: LINE_REVIEWS_ENTRY_POINT,
    lineReviews,
  });
};

export const getLineReviewDocuments = async (
  client: CogniteClient,
  lineReview: LineReview
) => {
  const lineReviewEntryPoint = await getJsonByExternalId<DocumentsForLine>(
    client,
    lineReview.entryFileExternalId
  );

  const documents = await Promise.all(
    lineReviewEntryPoint.parsedDocuments.map((externalId) =>
      getJsonByExternalId<ParsedDocument>(client, externalId)
    )
  );

  return documents;
};

const getLineReviewStateExternalIdByLineReviewId = (id: string) =>
  `linewalk-${id}-${VERSION}-state.json`;

export const getLineReviewState = async (
  client: CogniteClient,
  lineReview: LineReview
) => {
  try {
    const lineReviewState = await getJsonByExternalId<LineReviewState>(
      client,
      getLineReviewStateExternalIdByLineReviewId(lineReview.id)
    );
    return lineReviewState;
  } catch (error) {
    return undefined;
  }
};

export const saveLineReviewState = async (
  client: CogniteClient,
  lineReview: LineReview,
  state: any
) => {
  try {
    const lineReviewState = await saveJsonByExternalId<LineReviewState>(
      client,
      getLineReviewStateExternalIdByLineReviewId(lineReview.id),
      state
    );
    return lineReviewState;
  } catch (error) {
    return undefined;
  }
};

export const updateLineReviews = async (
  client: CogniteClient,
  update: LineReview
) => {
  const lineReviews = await getLineReviews(client);
  await saveLineReviews(
    client,
    lineReviews.map((lineReview) => ({
      ...lineReview,
      ...(update.id === lineReview.id ? update : lineReview),
    }))
  );
};
