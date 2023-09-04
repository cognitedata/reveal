import { useMemo } from 'react';

import { matchSorter } from 'match-sorter';

import { USER_IDENTIFIER_REGEXP } from '../constants';
import { Comment } from '../services/comments/types';
import { UserProfile } from '../UserProfileProvider';

type UseCommentsPaneSearchProps = {
  comments: Comment[];
  searchString: string;
  users: UserProfile[];
};

export const useCommentsPaneSearch = ({
  comments,
  searchString,
  users,
}: UseCommentsPaneSearchProps) => {
  // TODO: here we are not tokenizing the 'displayName',
  // we can add it later to search for surnames etc. from the 'displayName'.

  const transformedComments = useMemo(() => {
    const usersObject: Record<string, string> = {};
    users.forEach((user) => {
      usersObject[user.userIdentifier] = (user.displayName ?? '')
        .replace(/\s+/g, ' ')
        .trim();
    });

    const commentsWithDisplayNames = comments.map((comment) => ({
      ...comment,
      textWithNames: comment.text.replace(
        USER_IDENTIFIER_REGEXP,
        (match, userId) => {
          return usersObject[userId] ?? match;
        }
      ),
    }));

    return commentsWithDisplayNames;
  }, [users, comments]);

  const filteredComments = matchSorter(transformedComments, searchString, {
    keys: ['textWithNames', 'text'],
  });

  return {
    filteredComments,
  };
};
