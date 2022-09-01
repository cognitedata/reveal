import { ObjectFeedback } from '@cognite/discover-api-types';

export const getObjectFeedback = (extras?: ObjectFeedback): ObjectFeedback => ({
  comment: 'comment',
  documentId: '12345',
  isIncorrectGeo: false,
  isOther: false,
  isSensitiveData: false,
  ...extras,
});
