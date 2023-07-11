import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { QueryKeys } from '../../../../constants';
import { CommentService } from '../../CommentService';
import { Comment, CommentFilter } from '../../types';

export const useListCommentsQuery = <ContextDataType = any>(
  filter: CommentFilter = {}
) => {
  const sdk = useSDK();
  const service = useMemo(() => new CommentService(sdk), [sdk]);
  return useQuery<Comment<ContextDataType>[]>(
    [QueryKeys.LIST_COMMENTS, filter],
    async () => service.listComments(filter)
  );
};
