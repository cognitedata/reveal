import { useFeatureToggle, useUpdateFeatureToggle } from './flag';

export const useSuggestionsFeatureFlag = () =>
  useFeatureToggle('DEVX_MATCHMAKER_SUGGESTIONS_UI');

export const useUpdateSuggestionsFeatureFlag = () =>
  useUpdateFeatureToggle('DEVX_MATCHMAKER_SUGGESTIONS_UI');
