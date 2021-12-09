import { makeMockLineReview } from './mocks';
import { LineReview } from './types';

let MOCK_LINE_REVIEWS = [
  makeMockLineReview('1'),
  makeMockLineReview('2', 'RESOLVED'),
  makeMockLineReview('3', 'REVIEW'),
  makeMockLineReview('4', 'OPEN', ['Alison']),
  makeMockLineReview('5', 'OPEN', ['Richard']),
  makeMockLineReview('6', 'OPEN', ['Alison']),
  makeMockLineReview('7', 'OPEN', ['Alison']),
  makeMockLineReview('8', 'OPEN', ['Alison', 'Richard']),
  makeMockLineReview('9', 'RESOLVED'),
  makeMockLineReview('10', 'REVIEW'),
];

export const fetchLineReviews = async () => {
  // NEXT: Fetch from API
  return MOCK_LINE_REVIEWS;
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
