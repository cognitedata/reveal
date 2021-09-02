import { CommentResponse } from '@cognite/comment-service-types';
import { MessageType } from '@cognite/cogs.js';

export const normalizeComments = (comments: CommentResponse[]): MessageType[] =>
  comments.map(normalizeComment);

export const normalizeComment = (comment: CommentResponse): MessageType => {
  return {
    id: comment.id || '',
    // eslint-disable-next-line no-underscore-dangle
    user: comment._owner || 'Unknown',
    timestamp: Number(new Date(comment.lastUpdatedTime || '')),
    text: comment.comment,
    // hide?: boolean,
    // isUnread?: boolean,
  };
};
