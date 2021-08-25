import { CommentTarget } from '@cognite/comment-service-types';

export const commentKeys = {
  all: ['comments'] as const,
  threads: () => [...commentKeys.all, 'thread'] as const,
  thread: (filters: CommentTarget) =>
    [...commentKeys.threads(), { filters }] as const,
};
