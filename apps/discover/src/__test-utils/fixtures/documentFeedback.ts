import { DocumentFeedbackListResponse } from 'domain/documents/service/types';

import { ItemsResponse } from '@cognite/sdk';

export const getMockDocumentFeedbackDetails =
  (): ItemsResponse<DocumentFeedbackListResponse> => {
    return {
      items: [
        {
          documentId: 100,
          label: { externalId: 'testId1' },
          status: 'ACCEPTED',
          reviewedAt: '',
          reporterInfo: '',
          action: 'ATTACH',
          feedbackId: 1254,
          createdAt: '',
        },
        {
          documentId: 101,
          label: { externalId: 'testId2' },
          status: 'TestStatus',
          reviewedAt: '',
          reporterInfo: '',
          action: 'DETACH',
          feedbackId: 2554,
          createdAt: '',
        },
        {
          documentId: 102,
          label: { externalId: 'testId3' },
          status: 'Rejected',
          reviewedAt: '',
          reporterInfo: '',
          action: 'ATTACH',
          feedbackId: 1255,
          createdAt: '',
        },
      ],
    };
  };

export const getAcceptMockFeedback =
  (): ItemsResponse<DocumentFeedbackListResponse> => {
    return {
      items: [
        {
          documentId: 100,
          label: { externalId: 'testId1' },
          status: 'ACCEPTED',
          reviewedAt: '',
          reporterInfo: '',
          action: 'ATTACH',
          feedbackId: 125,
          createdAt: '',
        },
      ],
    };
  };

export const getRejectMockFeedback =
  (): ItemsResponse<DocumentFeedbackListResponse> => {
    return {
      items: [
        {
          documentId: 100,
          label: { externalId: 'testId1' },
          status: 'REJECTED',
          reviewedAt: '',
          reporterInfo: '',
          action: 'ATTACH',
          feedbackId: 1554,
          createdAt: '',
        },
      ],
    };
  };
