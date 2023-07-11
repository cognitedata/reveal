import { useMemo } from 'react';

import { captureException } from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import uniqBy from 'lodash/uniqBy';

import { toast } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import { QueryKeys, TOAST_POSITION } from '../../../../constants';
import { CommentService } from '../../CommentService';
import { Comment } from '../../types';

export const useCommentsUpsertMutation = <ContextDataType = any>() => {
  const queryClient = useQueryClient();
  const sdk = useSDK();
  const service = useMemo(() => new CommentService(sdk), [sdk]);

  return useMutation(
    [QueryKeys.UPSERT_COMMENTS],
    (
      comments: Omit<
        Comment<ContextDataType>,
        'lastUpdatedTime' | 'createdTime'
      >[]
    ) => service.upsertComments(comments),
    {
      onMutate: async (comments) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries([
          QueryKeys.FETCH_COMMENTS_BY_IDS,
          ...comments.map(({ externalId }) => externalId),
        ]);

        await queryClient.cancelQueries([QueryKeys.LIST_COMMENTS]);
        queryClient.setQueriesData<Comment<ContextDataType>[]>(
          [QueryKeys.LIST_COMMENTS],
          (previousComments: Comment<ContextDataType>[] = []) =>
            uniqBy(
              [
                ...comments.map((comment) => ({
                  ...comment,
                  createdTime: new Date(),
                  lastUpdatedTime: new Date(),
                })),
                ...previousComments,
              ],
              (comment) => comment.externalId
            )
        );

        return true;
      },
      onError: (err, _failedComment, context?: boolean) => {
        if (context === true) {
          // Refetch since we don't know which queries have been updated
          queryClient.refetchQueries([QueryKeys.LIST_COMMENTS]);
        }
        captureException(err);
        toast.error('Failed to update comment', {
          toastId: 'industry-comment-update-error',
          position: TOAST_POSITION,
        });
      },
    }
  );
};
