import { CommentResponse } from '@cognite/comment-service-types';
import { MessageType } from '@cognite/cogs.js';

export const getComment = (
  extras: Partial<CommentResponse> = {}
): CommentResponse => {
  return {
    id: 'test-id',
    _owner: 'test-_owner',
    comment: 'test-comment',
    target: { id: 'test-id', targetType: 'test-target' },
    createdTime: '2021-08-26T07:39:12.092Z',
    lastUpdatedTime: '2021-08-26T07:39:12.092Z',
    ...extras,
  };
};

// the cogs type
export const getMessage = (extras: Partial<MessageType> = {}): MessageType => {
  return {
    id: 'test-id',
    user: 'test-user',
    text: 'test-comment',
    timestamp: 1629962411026,
    ...extras,
  };
};
