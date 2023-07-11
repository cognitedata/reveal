import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { QueryKeys } from '../../../../constants';
import { CommentService } from '../../CommentService';
import { Comment } from '../../types';

export const useFetchCommentsByIdsQuery = <ContextDataType = any>(
  externalIds: string[]
) => {
  const sdk = useSDK();
  const service = useMemo(() => new CommentService(sdk), [sdk]);
  return useQuery<Comment<ContextDataType>[]>(
    [QueryKeys.FETCH_COMMENTS_BY_IDS, ...externalIds],
    async () => service.fetchCommentsByIds(externalIds)
  );
};
