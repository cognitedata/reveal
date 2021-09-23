import axios from 'axios';
import { useMutation, useQueryClient } from 'react-query';
import {
  Comment,
  CommentResponse,
  CommentTarget,
} from '@cognite/comment-service-types';
import { AuthHeaders, getAuthHeaders } from '@cognite/react-container';

import { commentKeys } from './queryKeys';

interface Props {
  comment: string;
  serviceUrl: string;
  scope?: string;
  headers: AuthHeaders;
  target: CommentTarget;
}
export const doCreateComment: (props: Props) => Promise<any> = ({
  target,
  scope,
  comment,
  headers,
  serviceUrl,
}) => {
  return axios
    .post<{ items: CommentResponse[] }>(
      `${serviceUrl}/comment`,
      {
        target,
        scope,
        comment,
      },
      { headers }
    )
    .then((result) => {
      return result;
    });
};

export function useCommentCreateMutate({
  target,
  scope,
  serviceUrl,
}: {
  serviceUrl: string;
  scope?: string;
  target: CommentTarget;
}) {
  const headers = getAuthHeaders({ useIdToken: true });
  const queryClient = useQueryClient();

  return useMutation(
    (comment: Comment['comment']) =>
      doCreateComment({
        target,
        scope,
        comment,
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
