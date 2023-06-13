import { useFlag } from '@cognite/react-feature-flags';

export const useFlagPointsOfInterestFeature = () => {
  const { isEnabled } = useFlag('DATA_EXPLORATION_POINTS_OF_INTEREST', {
    forceRerender: true,
    fallback: false,
  });
  return isEnabled;
};
