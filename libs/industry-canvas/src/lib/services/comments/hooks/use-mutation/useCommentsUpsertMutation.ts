import { useMemo } from 'react';

import { captureException } from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import uniqBy from 'lodash/uniqBy';

import { toast } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import { QueryKeys, TOAST_POSITION } from '../../../../constants';
import { CommentService } from '../../CommentService';
import { SerializedComment } from '../../types';

export const useCommentsUpsertMutation = () => {
  const queryClient = useQueryClient();
  const sdk = useSDK();
  const service = useMemo(() => new CommentService(sdk), [sdk]);

  return useMutation(
    [QueryKeys.UPSERT_COMMENTS],
    (comments: Omit<SerializedComment, 'lastUpdatedTime' | 'createdTime'>[]) =>
      service.upsertComments(comments),
    {
      onMutate: async (comments) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries([QueryKeys.LIST_COMMENTS]);

        // Optimistically update to the new value
        queryClient.setQueriesData<SerializedComment[]>(
          [QueryKeys.LIST_COMMENTS],
          (previousComments: SerializedComment[] = []) =>
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
      onSettled: (comments) => {
        if (comments === undefined) {
          return;
        }
        queryClient.invalidateQueries([QueryKeys.LIST_COMMENTS]);
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
