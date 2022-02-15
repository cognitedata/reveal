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
