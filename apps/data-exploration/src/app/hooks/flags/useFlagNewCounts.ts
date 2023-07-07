import { useFlag } from '@cognite/react-feature-flags';

export const useFlagNewCounts = () => {
  const { isEnabled } = useFlag('DATA_EXPLORATION_new_counts', {
    forceRerender: true,
    fallback: false,
  });

  return isEnabled;
};
