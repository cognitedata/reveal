import { useFlag } from '../../environments/useFlag';

export const useManualPopulationFeatureFlag = () => {
  return useFlag('DEVX_MANUAL_POPULATION', {
    fallback: true,
  });
};
