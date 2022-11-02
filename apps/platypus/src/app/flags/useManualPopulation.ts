import { useFlag } from '@cognite/react-feature-flags';

export const useManualPopulationFeatureFlag = () => {
  return useFlag('DEVX_MANUAL_POPULATION', {
    fallback: false,
  });
};
