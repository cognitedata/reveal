import { useFeatureToggle, useUpdateFeatureToggle } from './flag';

export const useGPTSearch = () => useFeatureToggle('GPT_SEARCH');
export const useUpdateGPTSearch = () => useUpdateFeatureToggle('GPT_SEARCH');
