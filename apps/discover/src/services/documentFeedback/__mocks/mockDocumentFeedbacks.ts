import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { ItemsResponse } from '@cognite/sdk';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

import { DocumentFeedbackListResponse } from '../types';

const documentFeedbackUrl = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/documents/feedback`;

export const getMockListDocumentFeedback = (
  customResponse?: ItemsResponse<DocumentFeedbackListResponse>
): MSWRequest => {
  return rest.get<Request>(documentFeedbackUrl, (_req, res, ctx) => {
    return res(ctx.json(customResponse));
  });
};

export const postMockDocumentFeedback = (
  customResponse?: ItemsResponse<DocumentFeedbackListResponse>
): MSWRequest => {
  return rest.post<Request>(documentFeedbackUrl, (_req, res, ctx) => {
    return res(ctx.json(customResponse));
  });
};

export const acceptMockDocumentFeedback = (
  customResponse?: any
): MSWRequest => {
  const url = `${documentFeedbackUrl}/accept`;
  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(customResponse));
  });
};

export const rejectMockDocumentFeedback = (
  customResponse?: any
): MSWRequest => {
  const url = `${documentFeedbackUrl}/reject`;
  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(customResponse));
  });
};
