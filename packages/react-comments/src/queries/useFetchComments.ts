import axios from 'axios';
import { useQuery } from 'react-query';
import {
  CommentListBody,
  CommentResponse,
  CommentTarget,
} from '@cognite/comment-service-types';
import { AuthHeaders, getAuthHeaders } from '@cognite/react-container';

import { normalizeComments } from '../utils/normalize';

import { commentKeys } from './queryKeys';

export type FetchCommentProps = {
  serviceUrl: string;
  scope?: CommentListBody['scope'];
  target: CommentTarget;
};

export const doFetchComments = ({
  headers,
  target,
  serviceUrl,
  scope,
}: {
  headers: AuthHeaders;
} & FetchCommentProps) => {
  return axios
    .post<{ items: CommentResponse[] }>(
      `${serviceUrl}/comment/list`,
      {
        filter: { target },
        scope,
      },
      { headers }
    )
    .then((result) => {
      return normalizeComments(result.data.items);
    });
};

export const useFetchComments = ({
  target,
  serviceUrl,
  scope,
}: FetchCommentProps) => {
  const headers = getAuthHeaders({ useIdToken: true });

  return useQuery(
    commentKeys.thread(target),
    () => doFetchComments({ target, serviceUrl, headers, scope }),
    {
      enabled: !!target,
      staleTime: 1000 * 60 * 5, // 5 mins
    }
  );
};
