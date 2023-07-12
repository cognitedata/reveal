import uniq from 'lodash/uniq';

import { useUserProfilesByIds } from '../../../hooks/use-query/useUserProfilesByIds';
import { Comment, CommentWithUserProfile } from '../types';

const isValidString = (str: string | undefined): str is string =>
  typeof str === 'string' && str.trim().length > 0;

export type UseCommentsWithUserProfilesReturnType<ContextDataType = any> = {
  commentsWithUserProfiles: CommentWithUserProfile<ContextDataType>[];
};

export const useCommentsWithUserProfiles = <ContextDataType = any>(
  comments: Comment<ContextDataType>[]
): UseCommentsWithUserProfilesReturnType<ContextDataType> => {
  const { userProfiles } = useUserProfilesByIds({
    userIdentifiers: uniq(
      comments
        .flatMap((comment) => [
          comment.createdById,
          ...(comment.taggedUsers ?? []),
        ])
        .filter(isValidString)
    ),
  });

  return {
    commentsWithUserProfiles: comments.map(
      (comment): CommentWithUserProfile => ({
        ...comment,
        createdBy: userProfiles.find(
          (userProfile) => userProfile.userIdentifier === comment.createdById
        ),
        taggedUsers: comment.taggedUsers?.map((taggedUser) =>
          userProfiles.find(
            (userProfile) => userProfile.userIdentifier === taggedUser
          )
        ),
      })
    ),
  };
};
