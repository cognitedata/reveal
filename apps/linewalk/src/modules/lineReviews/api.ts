import { MOCK_LINE_REVIEW_0040_0132 } from './mocks';
import { ParsedDocument, LineReview, DocumentsForLine } from './types';

let MOCK_LINE_REVIEWS = [MOCK_LINE_REVIEW_0040_0132];

export const getLineReviews = async () => {
  // NEXT: Fetch from API
  return MOCK_LINE_REVIEWS;
};

export const getDocumentUrlByExternalId =
  (client: any) =>
  async (externalId: string): Promise<string> => {
    try {
      const response = await client.files.getDownloadUrls([{ externalId }]);
      return response[0].downloadUrl;
    } catch (error) {
      throw new Error('Getting document url failed');
    }
  };

const getJsonByExternalId = async <T = unknown>(
  client: any,
  externalId: string
): Promise<T> => {
  const url = await getDocumentUrlByExternalId(client)(externalId);
  const response = await fetch(url);
  const json = await response.json();
  return json;
};

export const getLineReviewDocuments = async (
  client: any,
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

export const updateLineReviews = async (updates: LineReview[]) => {
  // NEXT: Fetch from API
  updates.forEach((update) => {
    MOCK_LINE_REVIEWS = MOCK_LINE_REVIEWS.map((d) => {
      if (d.id === update.id) {
        return {
          ...d,
          ...update,
        };
      }
      return d;
    });
  });
  return true;
};
