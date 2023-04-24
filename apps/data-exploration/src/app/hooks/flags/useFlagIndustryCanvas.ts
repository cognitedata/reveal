import { useFlag } from '@cognite/react-feature-flags';

export const useFlagIndustryCanvas = () => {
  const { isEnabled } = useFlag('UFV_INDUSTRY_CANVAS', {
    fallback: false,
    forceRerender: true,
  });
  return isEnabled;
};
