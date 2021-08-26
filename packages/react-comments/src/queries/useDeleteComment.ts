import axios from 'axios';
import { CommentResponse, CommentTarget } from '@cognite/comment-service-types';
import { AuthHeaders } from '@cognite/react-container';
import { useMutation, useQueryClient } from 'react-query';

import { commentKeys } from './queryKeys';

interface Props {
  id: string;
  serviceUrl: string;
  headers: AuthHeaders;
  target: CommentTarget;
}
export const useDeleteComment: (props: Props) => Promise<any> = ({
  id,
  target,
  headers,
  serviceUrl,
}) => {
  return axios
    .post<{ items: CommentResponse[] }>(
      `${serviceUrl}/comment/delete`,
      [
        {
          id,
          target,
        },
      ],
      { headers }
    )
    .then((result) => {
      return result;
    });
};

export function useCommentDeleteMutate({
  target,
  headers,
  serviceUrl,
}: {
  serviceUrl: string;
  headers: AuthHeaders;
  target: CommentTarget;
}) {
  const queryClient = useQueryClient();

  return useMutation(
    (id: string) =>
      useDeleteComment({
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
