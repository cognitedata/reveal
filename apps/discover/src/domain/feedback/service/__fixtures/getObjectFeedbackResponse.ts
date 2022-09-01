import { ObjectFeedbackResponse } from '@cognite/discover-api-types';

export const getObjectFeedbackResponse = (
  extras?: Partial<ObjectFeedbackResponse>
): ObjectFeedbackResponse => ({
  id: '12345',
  comment: 'comment',
  lastUpdatedTime: '2021-07-26T17:30:00.133Z',
  createdTime: '2021-07-26T17:30:00.133Z',
  documentId: '12345',
  isIncorrectGeo: false,
  isOther: false,
  isSensitiveData: false,
  ...extras,
});
