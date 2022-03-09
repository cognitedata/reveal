import axios from 'axios';
import { useQuery } from 'react-query';
import {
  CommentListBody,
  CommentResponse,
  CommentTarget,
} from '@cognite/comment-service-types';
import { AuthHeaders } from '@cognite/react-container';
import { getHeaders } from 'utils/getHeaders';

import { normalizeComments } from '../utils/normalize';

import { commentKeys } from './queryKeys';

export type FetchCommentProps = {
  serviceUrl: string;
  scope?: CommentListBody['scope'];
  target: CommentTarget;
  fasAppId?: string;
  idToken?: string;
};

export const doFetchComments = ({
  headers,
  target,
  serviceUrl,
  scope,
}: {
  headers: AuthHeaders | { fasAppId?: string };
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
  fasAppId,
  idToken,
}: FetchCommentProps) => {
  const headers = getHeaders(fasAppId, idToken);

  return useQuery(
    commentKeys.thread(target),
    () =>
      doFetchComments({
        target,
        serviceUrl,
        headers,
        scope,
      }),
    {
      enabled: !!target,
      staleTime: 1000 * 60 * 5, // 5 mins
    }
  );
};
