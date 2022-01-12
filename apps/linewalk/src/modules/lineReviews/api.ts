import {
  MOCK_LINE_REVIEW_0040_0029,
  MOCK_LINE_REVIEW_0040_0132,
} from './mocks';
import { Document, LineReview } from './types';

let MOCK_LINE_REVIEWS = [
  MOCK_LINE_REVIEW_0040_0029,
  MOCK_LINE_REVIEW_0040_0132,
];

export const fetchLineReviews = async () => {
  // NEXT: Fetch from API
  return MOCK_LINE_REVIEWS;
};

export const getDocumentUrl = async (client: any, document: Document) => {
  try {
    const response = await client.files.getDownloadUrls([{ id: document.id }]);
    return response[0].downloadUrl;
  } catch (error) {
    throw new Error('Getting document url failed');
  }
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
