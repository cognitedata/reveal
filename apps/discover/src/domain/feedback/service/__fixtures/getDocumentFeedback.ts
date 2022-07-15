import { FeedbackPostBody, ObjectFeedback } from '@cognite/discover-api-types';

export const getDocumentFeedback = (
  extras: Partial<ObjectFeedback>
): FeedbackPostBody => {
  return {
    payload: {
      isIncorrectGeo: true,
      isOther: true,
      isSensitiveData: false,
      documentId: '6767499658945224',
      documentExternalId: '15_9_19_A_1980_01_01',
      originalType: '',
      fileLocation: '',
      status: 0,
      deleted: false,
      suggestedType: 'Completion Report',
      suggestedTypeLabelId: 'SUBSURFACE_COMPLETION_REPORT',
      ...extras,
    },
  };
};
