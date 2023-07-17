import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import uniq from 'lodash/uniq';

import { useSDK } from '@cognite/sdk-provider';

import { QueryKeys } from '../../../../constants';
import { useUserProfilesByIds } from '../../../../hooks/use-query/useUserProfilesByIds';
import { isNotUndefined } from '../../../../utils/isNotUndefined';
import { CommentService } from '../../CommentService';
import { Comment, CommentFilter, SerializedComment } from '../../types';
import { isNonEmptyString } from '../../utils';

type UseListCommentsQueryReturnType<ContextDataType> = {
  comments: Comment<ContextDataType>[];
  isLoading: boolean;
  isError: boolean;
};

const useListSerializedCommentsQuery = <ContextDataType = any>(
  filter: CommentFilter
) => {
  const sdk = useSDK();
  const service = useMemo(() => new CommentService(sdk), [sdk]);
  return useQuery<SerializedComment<ContextDataType>[]>(
    [QueryKeys.LIST_COMMENTS, filter],
    async () => service.listComments(filter)
  );
};

export const useListCommentsQuery = <ContextDataType = any>(
  filter: CommentFilter = {}
): UseListCommentsQueryReturnType<ContextDataType> => {
  const {
    data: serializedComments = [],
    isLoading: isLoadingSerializedComments,
    isError: isErrorSerializedComments,
  } = useListSerializedCommentsQuery<ContextDataType>(filter);
  const userIdentifiers = useMemo(
    () =>
      uniq(
        serializedComments
          .flatMap((comment) => [
            comment.createdById,
            ...(comment.taggedUsers ?? []),
          ])
          .filter(isNonEmptyString)
      ),
    [serializedComments]
  );
  const {
    userProfiles,
    isLoading: isLoadingUserProfiles,
    isError: isErrorUserProfiles,
  } = useUserProfilesByIds({ userIdentifiers });

  const comments = useMemo(
    () =>
      serializedComments.map(
        (comment): Comment<ContextDataType> => ({
          ...comment,
          createdBy: userProfiles.find(
            (userProfile) => userProfile.userIdentifier === comment.createdById
          ),
          taggedUsers: comment.taggedUsers
            ?.map((taggedUser) =>
              userProfiles.find(
                (userProfile) => userProfile.userIdentifier === taggedUser
              )
            )
            .filter(isNotUndefined),
        })
      ),
    [serializedComments, userProfiles]
  );
  return {
    comments,
    isLoading: isLoadingSerializedComments || isLoadingUserProfiles,
    isError: isErrorSerializedComments || isErrorUserProfiles,
  };
};
