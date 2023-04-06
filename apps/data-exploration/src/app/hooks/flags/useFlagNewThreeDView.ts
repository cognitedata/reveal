import { useFlag } from '@cognite/react-feature-flags';

/**
 * Flag used for developing the new 3D model selection page
 *
 * Story: https://cognitedata.atlassian.net/browse/DEGR-1767
 */
export const useFlagNewThreeDView = () => {
  const { isEnabled } = useFlag('DATA_EXPLORATION_new_threeD_view', {
    forceRerender: true,
    fallback: false,
  });

  return isEnabled;
};
