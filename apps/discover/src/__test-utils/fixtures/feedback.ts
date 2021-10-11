import {
  DocumentFeedbackItem,
  NewDocumentFeedbackItem,
} from 'modules/feedback/types';

export const getMockedDocumentFeedbackItem = (
  extras?: Partial<DocumentFeedbackItem>
): DocumentFeedbackItem => ({
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

export const getMockedNewDocumentFeedbackItem = (
  extras?: NewDocumentFeedbackItem
): NewDocumentFeedbackItem => ({
  comment: 'comment',
  documentId: '12345',
  isIncorrectGeo: false,
  isOther: false,
  isSensitiveData: false,
  ...extras,
});
