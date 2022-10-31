import { useFlag } from '@cognite/react-feature-flags';

export const useManualPopulationFeatureFlag = () => {
  return useFlag('DATA_EXPLORATION_DEVX_MANUAL_POPULATION', {
    fallback: false,
  });
};
