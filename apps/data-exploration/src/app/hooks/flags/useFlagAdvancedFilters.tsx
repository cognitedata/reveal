import { useFlag } from '@cognite/react-feature-flags';

/**
 * Flag used for developing the new filter style
 *
 * Epic: https://cognitedata.atlassian.net/browse/DEGDEV-236
 */
export const useFlagAdvancedFilters = () => {
  const { isEnabled } = useFlag('DATA_EXPLORATION_advanced_filters', {
    forceRerender: true,
    fallback: false,
  });

  return isEnabled;
};
