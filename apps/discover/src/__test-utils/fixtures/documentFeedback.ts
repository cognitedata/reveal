import { DocumentFeedbackListResponse } from 'domain/documents/service/types';

import { ItemsResponse } from '@cognite/sdk';

export const getMockDocumentFeedbackDetails =
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
          feedbackId: 1255,
          createdAt: '2021-02-06T16:24:23.284407',
        },
        {
          documentId: 100,
          label: { externalId: 'testId1' },
          status: 'ACCEPTED',
          reviewedAt: '',
          reporterInfo: '',
          action: 'ATTACH',
          feedbackId: 1254,
          createdAt: '2021-02-05T16:24:23.284407',
        },
        {
          documentId: 101,
          label: { externalId: 'testId1' },
          status: 'CREATED',
          reviewedAt: '',
          reporterInfo: '',
          action: 'DETACH',
          feedbackId: 2554,
          createdAt: '2021-02-06T16:24:23.284407',
        },
        {
          documentId: 102,
          label: { externalId: 'testId3' },
          status: 'REJECTED',
          reviewedAt: '',
          reporterInfo: '',
          action: 'ATTACH',
          feedbackId: 1255,
          createdAt: '2021-02-07T16:24:23.284407',
        },
        {
          documentId: 102,
          label: { externalId: 'testId3' },
          status: 'ACCEPTED',
          reviewedAt: '',
          reporterInfo: '',
          action: 'ATTACH',
          feedbackId: 1255,
          createdAt: '2021-02-07T16:24:23.284407',
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
