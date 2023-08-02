import { useMemo } from 'react';

import { UserProfile } from '../UserProfileProvider';
import caseInsensitiveIncludes from '../utils/caseInsensitiveIncludes';
import caseInsensitiveStartsWith from '../utils/caseInsensitiveStartsWith';

type UseCommentsPaneSearchProps<T> = {
  comments: T[];
  searchString: string;
};

type UseCommentsPaneSearchReturnType<T> = {
  filteredComments: T[];
};

export const useCommentsPaneSearch = <
  T extends {
    text: string;
    externalId: string;
    createdBy?: UserProfile;
  }
>({
  comments,
  searchString,
}: UseCommentsPaneSearchProps<T>): UseCommentsPaneSearchReturnType<T> => {
  // TODO: here we are not tokenizing the 'displayName',
  // we can add it later to search for surnames etc. from the 'displayName'.
  const filteredComments = useMemo(
    () =>
      comments
        .filter(
          (comment) =>
            caseInsensitiveStartsWith(
              comment.createdBy?.displayName,
              searchString
            ) ||
            caseInsensitiveStartsWith(
              comment.createdBy?.givenName,
              searchString
            ) ||
            caseInsensitiveStartsWith(
              comment.createdBy?.surname,
              searchString
            ) ||
            caseInsensitiveIncludes(comment.text, searchString)
        )
        .reverse(), // We reverse the array to show the most recent message first in the list.
    [searchString, comments]
  );

  return {
    filteredComments,
  };
};
