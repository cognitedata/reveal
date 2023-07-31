import { CommentResponse } from '@cognite/comment-service-types';
import { MessageType } from '@cognite/cogs.js';

import { convertCommentToRichtext } from './convertCommentToRichtext';

export const normalizeComments = (
  comments: CommentResponse[]
): MessageType[] => {
  return comments.reduce((results, comment) => {
    const rawNormalizedComment = normalizeComment(comment);

    // here we can add in any options to hide some comments, eg:
    // if (!rawNormalizedComment.user) {
    //   return results;
    // }

    const formattedComment = convertCommentToRichtext(rawNormalizedComment);

    return [...results, formattedComment];
  }, [] as MessageType[]);
};

export const normalizeComment = (comment: CommentResponse): MessageType => {
  // eslint-disable-next-line no-underscore-dangle
  const owner = comment._owner;

  return {
    id: comment.id || '',
    user: comment.displayName || owner || 'Unknown',
    userId: owner,
    timestamp: Number(new Date(comment.createdTime || '')),
    text: comment.comment,
    // isUnread?: boolean,
  };
};
