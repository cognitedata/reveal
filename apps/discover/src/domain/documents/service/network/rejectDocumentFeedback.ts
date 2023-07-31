import { FetchHeaders, fetchPost } from 'utils/fetch';

import { ItemsResponse } from '@cognite/sdk';

import { SIDECAR } from 'constants/app';

import {
  DocumentFeedbackJudgeBody,
  DocumentFeedbackListResponse,
} from '../types';

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
