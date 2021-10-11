import { getTenantInfo } from '@cognite/react-container';

import { fetchGet, FetchHeaders, fetchPatch, fetchPost } from '_helpers/fetch';
import { SIDECAR } from 'constants/app';

import { FeedbackType } from './types';

export const feedback = {
  get: async <T>(feedbackType: FeedbackType, headers: FetchHeaders) => {
    const [tenant] = getTenantInfo();

    return fetchGet<T>(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/feedback-v2/${feedbackType}`,
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
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/feedback-v2/${feedbackType}/${id}`,
      {
        headers,
      }
    );
  },
  create: async (
    feedbackType: FeedbackType,
    payload: Record<string, unknown>,
    headers: FetchHeaders
  ) => {
    const [tenant] = getTenantInfo();

    return fetchPost(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/feedback/${feedbackType}`,
      {
        payload,
      },
      { headers }
    );
  },
  update: async (
    feedbackType: FeedbackType,
    data: { id: string; payload: Record<string, unknown> },
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
