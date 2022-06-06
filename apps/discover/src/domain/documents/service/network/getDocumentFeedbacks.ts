import { fetchGet, FetchHeaders } from 'utils/fetch';

import { ItemsResponse } from '@cognite/sdk';

import { SIDECAR } from 'constants/app';

import { DocumentFeedbackListResponse } from '../types';

export const getDocumentFeedbacks = (
  project: string,
  headers?: FetchHeaders
) => {
  const result = fetchGet<ItemsResponse<DocumentFeedbackListResponse>>(
    `${SIDECAR.cdfApiBaseUrl}/api/playground/projects/${project}/documents/feedback`,
    { headers }
  );
  return result;
};
