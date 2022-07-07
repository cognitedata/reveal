import { DocumentFeedbackCreateBody } from 'domain/documents/service/types';

export const adaptToDocumentFeedbackPayload = (
  action: 'ATTACH' | 'DETACH',
  documentId: number,
  labelExternalId: string,
  reporterInfo?: string
): DocumentFeedbackCreateBody => {
  return {
    documentId,
    label: {
      externalId: labelExternalId,
    },
    action,
    reporterInfo,
  };
};
