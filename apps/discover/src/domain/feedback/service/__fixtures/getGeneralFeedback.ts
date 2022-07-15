import { FeedbackPostBody, GeneralFeedback } from '@cognite/discover-api-types';

export const getGeneralFeedback = (
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
