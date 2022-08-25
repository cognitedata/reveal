import {
  ActionType,
  DocumentFeedbackCreateBody,
} from 'domain/documents/service/types';

export const adaptToDocumentFeedbackPayload = (
  action: ActionType,
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
