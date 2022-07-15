import { fetchGet, FetchHeaders, fetchPatch, fetchPost } from 'utils/fetch';

import {
  FeedbackPostBody,
  FeedbackPostResponse,
} from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import { SIDECAR } from 'constants/app';

import { FeedbackType, FeedbackPatchBody } from '../../internal/types';

export const feedback = {
  get: async <T>(feedbackType: FeedbackType, headers: FetchHeaders) => {
    const [tenant] = getTenantInfo();

    return fetchGet<T>(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/feedback/${feedbackType}`,
      {
        headers,
      }
    );
  },
  getOne: async <T>(
    feedbackType: FeedbackType,
    id: string,
    headers: FetchHeaders
  ) => {
    const [tenant] = getTenantInfo();

    return fetchGet<T>(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/feedback/${feedbackType}/${id}`,
      {
        headers,
      }
    );
  },
  create: async (
    feedbackType: FeedbackType,
    payload: FeedbackPostBody,
    headers: FetchHeaders
  ) => {
    const [tenant] = getTenantInfo();
    console.log('feedbackType', feedbackType);

    return fetchPost<FeedbackPostResponse>(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/feedback/${feedbackType}`,
      payload,
      { headers }
    );
  },
  update: async (
    feedbackType: FeedbackType,
    data: FeedbackPatchBody,
    headers: FetchHeaders
  ) => {
    const [tenant] = getTenantInfo();

    return fetchPatch(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/feedback/${feedbackType}`,
      data,
      {
        headers,
      }
    );
  },
};
