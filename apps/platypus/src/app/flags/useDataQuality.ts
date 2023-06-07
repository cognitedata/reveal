import { useFlag } from '../../environments/useFlag';

export const useDataQualityFeatureFlag = () => {
  return useFlag('DEVX_DATA_QUALITY_UI', {
    fallback: false,
    fallbackForTest: true,
  });
};
