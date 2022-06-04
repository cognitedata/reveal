import { UseMutateAsyncFunction } from 'react-query';

import {
  FeedbackPatchBodyGeneral,
  FeedbackPatchBodyObject,
  FeedbackPostBody,
} from '@cognite/discover-api-types';

export type FeedbackPatchBody =
  | FeedbackPatchBodyGeneral
  | FeedbackPatchBodyObject;

export type FeedbackType = 'general' | 'object' | 'sensitive';

export type MutateCreateFeedback = UseMutateAsyncFunction<
  unknown,
  unknown,
  FeedbackPostBody,
  unknown
>;

export type MutateUpdateFeedback = UseMutateAsyncFunction<
  unknown,
  unknown,
  FeedbackPatchBody,
  unknown
>;
