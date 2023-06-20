import { useMemo } from 'react';

import { captureException } from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';
import { toast } from '@cognite/cogs.js';

import { QueryKeys, TOAST_POSITION } from '../../constants';
import { IndustryCanvasService } from '../../services/IndustryCanvasService';
import { Comment } from '../../types';
import { useUserProfile } from '../../UserProfileProvider';

export const useCommentDeleteMutation = () => {
  const queryClient = useQueryClient();

  const { userProfile } = useUserProfile();
  const service = useMemo(
    () => new IndustryCanvasService(sdk, userProfile),
    [userProfile]
  );

  return useMutation(
    [QueryKeys.DELETE_COMMENT],
    async (comment: Comment) => {
      await service.deleteCommentByIds([
        comment.externalId,
        ...(comment.subComments
          ? comment.subComments?.map((el) => el.externalId)
          : []),
      ]);
      return comment;
    },
    {
      onMutate: async (updatedComment) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries([
          QueryKeys.GET_COMMENT,
          updatedComment.externalId,
        ]);
        await queryClient.cancelQueries([QueryKeys.LIST_COMMENTS]);

        // Optimistically update to the new values
        await queryClient.setQueriesData<Comment[]>(
          [QueryKeys.LIST_COMMENTS],
          (previousComments: Comment[] = []) => {
            return previousComments.filter(
              (comment) => comment.externalId !== updatedComment.externalId
            );
          }
        );
        if (updatedComment.thread) {
          const existingData = await queryClient.getQueryData<Comment>([
            QueryKeys.GET_COMMENT,
            updatedComment.thread.externalId,
          ]);
          if (existingData) {
            await queryClient.setQueryData<Comment>(
              [QueryKeys.GET_COMMENT, updatedComment.thread.externalId],
              () => ({
                ...existingData,
                subComments: (existingData.subComments || []).filter(
                  (comment) => comment.externalId !== updatedComment.externalId
                ),
              })
            );
          }
        }
        await queryClient.removeQueries([
          QueryKeys.GET_COMMENT,
          updatedComment.externalId,
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
      onSettled: (updatedComment) => {
        if (!updatedComment) {
          return;
        }
        queryClient.invalidateQueries({ queryKey: [QueryKeys.LIST_COMMENTS] });
      },
    }
  );
};
