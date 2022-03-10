import axios from 'axios';
import { CommentResponse, CommentTarget } from '@cognite/comment-service-types';
import { AuthHeaders } from '@cognite/react-container';
import { useMutation, useQueryClient } from 'react-query';

import { getHeaders } from '../utils/getHeaders';

import { commentKeys } from './queryKeys';

interface Props {
  id: string;
  serviceUrl: string;
  headers: AuthHeaders | { fasAppId?: string };
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
  fasAppId,
  idToken,
}: {
  serviceUrl: string;
  target: CommentTarget;
  fasAppId?: string;
  idToken?: string;
}) {
  const headers = getHeaders(fasAppId, idToken);
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
