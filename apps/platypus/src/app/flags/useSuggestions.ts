import { useFlag } from '../../environments/useFlag';

export const useSuggestionsFeatureFlag = () => {
  return useFlag('DEVX_MATCHMAKER_SUGGESTIONS_UI', {
    fallback: true,
  });
};
