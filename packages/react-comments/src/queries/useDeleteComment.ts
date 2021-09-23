import axios from 'axios';
import { CommentResponse, CommentTarget } from '@cognite/comment-service-types';
import { AuthHeaders, getAuthHeaders } from '@cognite/react-container';
import { useMutation, useQueryClient } from 'react-query';

import { commentKeys } from './queryKeys';

interface Props {
  id: string;
  serviceUrl: string;
  headers: AuthHeaders;
  target: CommentTarget;
}
export const doDeleteComment: (props: Props) => Promise<any> = ({
  id,
  target,
  headers,
  serviceUrl,
}) => {
  return axios
    .post<{ items: CommentResponse[] }>(
      `${serviceUrl}/comment/delete`,
      {
        items: [
          {
            id,
            target,
          },
        ],
      },
      { headers }
    )
    .then((result) => {
      return result;
    });
};

export function useCommentDeleteMutate({
  target,
  serviceUrl,
}: {
  serviceUrl: string;
  target: CommentTarget;
}) {
  const headers = getAuthHeaders({ useIdToken: true });
  const queryClient = useQueryClient();

  return useMutation(
    (id: string) =>
      doDeleteComment({
        id,
        target,
        headers,
        serviceUrl,
      }),
    {
      onSuccess: () => {
        return queryClient.invalidateQueries(commentKeys.thread(target));
      },
    }
  );
}
