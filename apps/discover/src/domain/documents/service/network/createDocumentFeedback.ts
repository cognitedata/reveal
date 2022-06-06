import { FetchHeaders, fetchPost } from 'utils/fetch';

import { ItemsResponse } from '@cognite/sdk';

import { SIDECAR } from 'constants/app';

import {
  DocumentFeedbackCreateBody,
  DocumentFeedbackCreateResponse,
} from '../types';

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
