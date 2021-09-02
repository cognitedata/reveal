import axios from 'axios';
import {
  Comment,
  CommentResponse,
  CommentTarget,
} from '@cognite/comment-service-types';
import { AuthHeaders } from '@cognite/react-container';
import { useMutation, useQueryClient } from 'react-query';

import { commentKeys } from './queryKeys';

interface Props {
  comment: string;
  serviceUrl: string;
  scope?: string;
  headers: AuthHeaders;
  target: CommentTarget;
}
export const useCreateComment: (props: Props) => Promise<any> = ({
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
  headers,
  scope,
  serviceUrl,
}: {
  serviceUrl: string;
  scope?: string;
  headers: AuthHeaders;
  target: CommentTarget;
}) {
  const queryClient = useQueryClient();

  return useMutation(
    (comment: Comment['comment']) =>
      useCreateComment({
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
