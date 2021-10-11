import { UseMutateAsyncFunction } from 'react-query';

export type FeedbackType = 'general' | 'object' | 'sensitive';

export type MutateCreateFeedback = UseMutateAsyncFunction<
  unknown,
  unknown,
  Record<string, unknown>,
  unknown
>;

export type MutateUpdateFeedback = UseMutateAsyncFunction<
  unknown,
  unknown,
  {
    id: string;
    payload: Record<string, unknown>;
  },
  unknown
>;
