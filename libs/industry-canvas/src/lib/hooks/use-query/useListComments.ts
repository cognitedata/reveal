import { useMemo } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';

import { QueryKeys } from '../../constants';
import { IndustryCanvasService } from '../../services/IndustryCanvasService';
import { Comment } from '../../types';
import { useUserProfile } from '../../UserProfileProvider';

export const useListComments = () => {
  const { userProfile } = useUserProfile();
  const queryClient = useQueryClient();
  const canvasService = useMemo(
    () => new IndustryCanvasService(sdk, userProfile),
    [userProfile]
  );
  return useQuery<Comment[]>(
    [QueryKeys.LIST_COMMENTS],
    async () => canvasService.listComments(),
    {
      onSettled: (data) => {
        for (const comment of data || []) {
          if (!comment.thread) {
            queryClient.invalidateQueries({
              queryKey: [QueryKeys.GET_COMMENT, comment.externalId],
            });
          }
        }
      },
    }
  );
};
