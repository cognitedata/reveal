import { v4 as uuid } from 'uuid';

import { LineReview, LineReviewAnnotation, LineReviewStatus } from './types';

const MOCK_LINE_REVIEW_ANNOTATION: LineReviewAnnotation = {
  min: [0.1, 0.1],
  max: [0.15, 0.15],
  status: 'UNCHECKED',
  title: '',
  description: '',
  comments: [],
};

export const MOCK_LINE_REVIEW: LineReview = {
  id: uuid(),
  name: 'LineReview A',
  status: 'OPEN',
  description: `Equipment does not match`,
  createdOn: Date.now(),
  assignees: [{ name: 'Alison' }],

  documents: [
    {
      fileExternalId: 'PID-ME-P-0021',
      annotations: [MOCK_LINE_REVIEW_ANNOTATION],
    },
    {
      fileExternalId: 'PID-ME-P-0024',
      annotations: [MOCK_LINE_REVIEW_ANNOTATION],
    },
  ],
  markup: [],
  comments: [],
};

export const makeMockLineReview = (
  id: string,
  status: LineReviewStatus = 'OPEN',
  assignees: string[] = []
): LineReview => {
  return {
    ...MOCK_LINE_REVIEW,
    id,
    status,
    assignees: assignees.map((a) => ({ name: a })),
    description: `Equipment does not match`,
  };
};
