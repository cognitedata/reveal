import { useFlag } from '@cognite/react-feature-flags';

export const useGPTSearch = () => useFlag('COGNITE_COPILOT');
// export const useUpdateGPTSearch = () => useUpdateFeatureToggle('GPT_SEARCH');
