import { DocumentCategories } from '@cognite/discover-api-types';

import { GenericApiError, BaseAPIResult } from 'core/types';

export type DocumentError = GenericApiError;

export interface DocumentCategoriesResult extends BaseAPIResult {
  data: DocumentCategories;
}

export type DocumentFeedbackType = 'accept' | 'reject';

export type DocumentFeedbackCreateBody = {
  documentId: number;
  label: {
    externalId: string;
  };
  action: 'ATTACH' | 'DETACH';
  reporterInfo: string;
};

export type DocumentFeedbackCreateResponse = DocumentFeedbackCreateBody & {
  status: string;
  feedbackId: number;
  createdAt: string;
};

export type DocumentFeedbackListResponse = DocumentFeedbackCreateResponse & {
  reviewedAt: string;
};

export type DocumentFeedbackJudgeBody = {
  id: number;
};
