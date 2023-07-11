import { useMemo } from 'react';

import { captureException } from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import { QueryKeys, TOAST_POSITION } from '../../../../constants';
import { CommentService } from '../../CommentService';
import { Comment } from '../../types';

export const useCommentsDeleteMutation = () => {
  const queryClient = useQueryClient();
  const sdk = useSDK();
  const service = useMemo(() => new CommentService(sdk), [sdk]);

  return useMutation(
    [QueryKeys.DELETE_COMMENT],
    async (externalIds: string[]) => service.deleteComments(externalIds),
    {
      onMutate: async (deletedCommentExternalIds) => {
        const removedExternalIds = new Set(deletedCommentExternalIds);
        // Cancel any outgoing refetches
        await queryClient.cancelQueries([
          QueryKeys.FETCH_COMMENTS_BY_IDS,
          ...removedExternalIds,
        ]);
        await queryClient.cancelQueries([QueryKeys.LIST_COMMENTS]);

        // Optimistically update to the new values
        queryClient.setQueriesData<Comment[]>(
          [QueryKeys.LIST_COMMENTS],
          (previousComments: Comment[] = []) =>
            previousComments.filter(
              (prevComment) => !removedExternalIds.has(prevComment.externalId)
            )
        );
        queryClient.removeQueries([
          QueryKeys.FETCH_COMMENTS_BY_IDS,
          ...removedExternalIds,
        ]);

        return true;
      },
      onError: (err, _, context?: boolean) => {
        if (context) {
          // Refetch since we don't know which queries have been updated
          queryClient.refetchQueries([QueryKeys.LIST_COMMENTS]);
        }
        captureException(err);
        toast.error('Failed to delete comment', {
          toastId: 'industry-canvas-update-error',
          position: TOAST_POSITION,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.LIST_COMMENTS] });
      },
    }
  );
};
