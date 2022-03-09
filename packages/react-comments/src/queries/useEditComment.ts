import axios from 'axios';
import { useMutation, useQueryClient } from 'react-query';
import { CommentResponse, CommentTarget } from '@cognite/comment-service-types';
import { AuthHeaders } from '@cognite/react-container';
import { getHeaders } from 'utils/getHeaders';

import { getRichtext } from '../utils/convertCommentToRichtext';

import { commentKeys } from './queryKeys';

type Props = {
  serviceUrl: string;
  headers: AuthHeaders | { fasAppId?: string };
} & Pick<CommentResponse, 'id' | 'comment' | 'target'>;
export const doEditComment: (props: Props) => Promise<any> = ({
  id,
  target,
  comment,
  headers,
  serviceUrl,
}) => {
  return axios
    .post<{ items: CommentResponse }>(
      `${serviceUrl}/comment/${id}`,
      {
        target,
        comment,
      },
      { headers }
    )
    .then((result) => {
      return result;
    });
};

export function useCommentEditMutate({
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
    ({
      id,
      comment,
    }: {
      comment: CommentResponse['comment'];
      id: CommentResponse['id'];
    }) =>
      doEditComment({
        id,
        comment,
        target,
        headers,
        serviceUrl,
      }),
    {
      onMutate: async ({ id, comment }) => {
        const key = commentKeys.thread(target);

        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(key);

        // Snapshot the previous value
        const previousData = queryClient.getQueryData(key);

        queryClient.setQueryData(key, (oldComments: unknown) => {
          return (oldComments as CommentResponse[]).map((commentItem) => {
            if (commentItem.id === id) {
              return {
                ...commentItem,
                updatedAt: Math.random(), // invalidate cache
                text: getRichtext(comment),
              };
            }

            return commentItem;
          });
        });

        // Return a context object with the snapshotted value
        return { previousData };
      },
    }
  );
}
