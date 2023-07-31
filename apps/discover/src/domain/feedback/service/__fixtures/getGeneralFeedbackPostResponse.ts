import { FeedbackPostBody, GeneralFeedback } from '@cognite/discover-api-types';

export const getGeneralFeedbackPostResponse = (
  extras: Partial<GeneralFeedback>
): FeedbackPostBody => {
  return {
    payload: {
      user: '',
      screenshotB64: '',
      deleted: false,
      status: 0,
      comment: '',
      ...extras,
    },
  };
};
