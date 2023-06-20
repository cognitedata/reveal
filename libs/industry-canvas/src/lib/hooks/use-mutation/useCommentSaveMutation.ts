import { useMemo } from 'react';

import { captureException } from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';
import { toast } from '@cognite/cogs.js';

import { QueryKeys, TOAST_POSITION } from '../../constants';
import { IndustryCanvasService } from '../../services/IndustryCanvasService';
import { Comment } from '../../types';
import { useUserProfile } from '../../UserProfileProvider';

export const useCommentSaveMutation = () => {
  const queryClient = useQueryClient();

  const { userProfile } = useUserProfile();
  const service = useMemo(
    () => new IndustryCanvasService(sdk, userProfile),
    [userProfile]
  );

  return useMutation(
    [QueryKeys.SAVE_COMMENT],
    (
      comment: Omit<Comment, 'createdTime' | 'lastUpdatedTime' | 'subComments'>
    ) => {
      return service.saveComment(comment);
    },
    {
      onMutate: async (comment) => {
        const updatedComment = {
          ...comment,
          createdTime: new Date(),
          lastUpdatedTime: new Date(),
          subComments: [],
        };
        // Cancel any outgoing refetches
        await queryClient.cancelQueries([
          QueryKeys.GET_COMMENT,
          updatedComment.externalId,
        ]);
        await queryClient.cancelQueries([QueryKeys.LIST_COMMENTS]);

        if (updatedComment.thread) {
          // Snapshot the previous values
          const existingData = queryClient.getQueryData<Comment>([
            QueryKeys.GET_COMMENT,
            updatedComment.thread.externalId,
          ]);

          // Optimistically update to the new values
          queryClient.setQueryData<Comment>(
            [QueryKeys.GET_COMMENT, updatedComment.thread.externalId],
            existingData
              ? {
                  ...existingData,
                  subComments: [
                    ...(existingData?.subComments || []),
                    updatedComment,
                  ],
                }
              : undefined
          );
        }
        queryClient.setQueriesData<Comment[]>(
          [QueryKeys.LIST_COMMENTS],
          (previousComments: Comment[] = []) => {
            return previousComments.concat(updatedComment);
          }
        );

        return true;
      },
      onError: (err, failedComment, context?: boolean) => {
        if (context) {
          // Refetch since we don't know which queries have been updated
          queryClient.refetchQueries([QueryKeys.LIST_COMMENTS]);
          if (failedComment.thread)
            queryClient.refetchQueries([
              QueryKeys.GET_COMMENT,
              failedComment.thread.externalId,
            ]);
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
