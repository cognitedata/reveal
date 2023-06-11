import { useQuery } from '@tanstack/react-query';

import { QueryKeys } from '../../constants';
import { Comment } from '../../types';

import { useListComments } from './useListComments';

export const useGetCommentByIdQuery = (commentId: string) => {
  const { data, ...props } = useListComments();
  const { data: comment } = useQuery<Comment | undefined>(
    [QueryKeys.GET_COMMENT, commentId],
    async () => {
      const comment = (data || []).find((el) => el.externalId === commentId);
      if (!comment) {
        return undefined;
      }
      return {
        ...comment,
        subComments: (data || [])
          .filter((el) => el.thread?.externalId === commentId)
          .sort((a, b) => a.createdTime.getTime() - b.createdTime.getTime()),
      };
    }
  );
  return { data: comment, ...props };
};
