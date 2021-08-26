import axios from 'axios';
import { useQuery } from 'react-query';
import { CommentResponse, CommentTarget } from '@cognite/comment-service-types';
import { AuthHeaders, getAuthHeaders } from '@cognite/react-container';

import { commentKeys } from './queryKeys';
import { normalizeComments } from './normalize';

interface Props {
  serviceUrl: string;
  target: CommentTarget;
}

export const doFetchComments = ({
  headers,
  target,
  serviceUrl,
}: {
  serviceUrl: string;
  headers: AuthHeaders;
  target: CommentTarget;
}) => {
  return axios
    .post<{ items: CommentResponse[] }>(
      `${serviceUrl}/comment/list`,
      {
        filter: { target, scope: ['fas-demo'] },
      },
      { headers }
    )
    .then((result) => {
      return normalizeComments(result.data.items);
    });
};

export const useFetchComments = ({ target, serviceUrl }: Props) => {
  const headers = getAuthHeaders({ useIdToken: true });

  return useQuery(commentKeys.thread(target), () =>
    doFetchComments({ target, serviceUrl, headers })
  );
};
