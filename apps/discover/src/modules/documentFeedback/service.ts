import { fetchGet, FetchHeaders, fetchPost } from 'utils/fetch';

import { ItemsResponse } from '@cognite/sdk';

import { SIDECAR } from 'constants/app';

import {
  DocumentFeedbackCreateBody,
  DocumentFeedbackCreateResponse,
  DocumentFeedbackJudgeBody,
  DocumentFeedbackListResponse,
} from './types';

export const listDocumentFeedbacks = (
  project: string,
  headers?: FetchHeaders
) => {
  const result = fetchGet<ItemsResponse<DocumentFeedbackListResponse>>(
    `${SIDECAR.cdfApiBaseUrl}/api/playground/projects/${project}/documents/feedback`,
    { headers }
  );
  return result;
};

export const createDocumentFeedback = (
  project: string,
  payload: ItemsResponse<DocumentFeedbackCreateBody>,
  headers?: FetchHeaders
) => {
  return fetchPost<ItemsResponse<DocumentFeedbackCreateResponse>>(
    `${SIDECAR.cdfApiBaseUrl}/api/playground/projects/${project}/documents/feedback`,
    payload,
    { headers }
  );
};

export const acceptDocumentFeedback = (
  project: string,
  payload: ItemsResponse<DocumentFeedbackJudgeBody>,
  headers?: FetchHeaders
) => {
  return fetchPost<ItemsResponse<DocumentFeedbackListResponse>>(
    `${SIDECAR.cdfApiBaseUrl}/api/playground/projects/${project}/documents/feedback/accept`,
    payload,
    { headers }
  );
};

export const rejectDocumentFeedback = (
  project: string,
  payload: ItemsResponse<DocumentFeedbackJudgeBody>,
  headers?: FetchHeaders
) => {
  return fetchPost<ItemsResponse<DocumentFeedbackListResponse>>(
    `${SIDECAR.cdfApiBaseUrl}/api/playground/projects/${project}/documents/feedback/reject`,
    payload,
    { headers }
  );
};
