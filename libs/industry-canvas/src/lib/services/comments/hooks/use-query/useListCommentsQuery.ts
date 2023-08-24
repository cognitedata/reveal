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

type UseListCommentsQueryReturnType = {
  comments: Comment[];
  isLoading: boolean;
  isError: boolean;
};

const useListSerializedCommentsQuery = (filter: CommentFilter) => {
  const sdk = useSDK();
  const service = useMemo(() => new CommentService(sdk), [sdk]);
  return useQuery<SerializedComment[]>(
    [QueryKeys.LIST_COMMENTS, filter],
    async () => service.listComments(filter),
    {
      enabled: filter.targetId !== undefined && filter.targetType !== undefined,
    }
  );
};

export const useListCommentsQuery = (
  filter: CommentFilter = {}
): UseListCommentsQueryReturnType => {
  const {
    data: serializedComments = [],
    isLoading: isLoadingSerializedComments,
    isError: isErrorSerializedComments,
  } = useListSerializedCommentsQuery(filter);
  const userIdentifiers = useMemo(
    () =>
      uniq(
        serializedComments
          .flatMap((comment) => [
            comment.createdBy.externalId,
            ...(comment.taggedUsers?.map(({ externalId }) => externalId) ?? []),
          ])
          .filter(isNonEmptyString)
      ),
    [serializedComments]
  );
  const {
    userProfiles,
    isLoading: isLoadingUserProfiles,
    isError: isErrorUserProfiles,
    fetchStatus: userProfilesFetchStatus,
  } = useUserProfilesByIds({ userIdentifiers });

  const comments = useMemo(
    () =>
      serializedComments.map(
        (comment): Comment => ({
          ...comment,
          createdBy: userProfiles.find(
            (userProfile) =>
              userProfile.userIdentifier === comment.createdBy.externalId
          ),
          taggedUsers: comment.taggedUsers
            ?.map((taggedUser) =>
              userProfiles.find(
                (userProfile) =>
                  userProfile.userIdentifier === taggedUser.externalId
              )
            )
            .filter(isNotUndefined),
        })
      ),
    [serializedComments, userProfiles]
  );
  return {
    comments,
    isLoading:
      isLoadingSerializedComments ||
      (isLoadingUserProfiles && userProfilesFetchStatus !== 'idle'),
    isError: isErrorSerializedComments || isErrorUserProfiles,
  };
};
