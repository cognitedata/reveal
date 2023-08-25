import { useFlag } from '@cognite/react-feature-flags';

import { useFeatureToggle, useUpdateFeatureToggle } from './flag';

export const useGPTSearch = () => {
  const { isEnabled } = useFeatureToggle('GPT_SEARCH');
  const { isEnabled: isEnabledForProject } = useFlag('AI_PLATYPUS_SEARCH');
  return { isEnabled: isEnabled && isEnabledForProject };
};
export const useGPTSearchForProject = () => useFlag('AI_PLATYPUS_SEARCH');
export const useUpdateGPTSearch = () => useUpdateFeatureToggle('GPT_SEARCH');
