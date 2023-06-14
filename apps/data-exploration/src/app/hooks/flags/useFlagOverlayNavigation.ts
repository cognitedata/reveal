import { useFlag } from '@cognite/react-feature-flags';

/**
 * Flag used for enabling new details overlay with updated navigation.
 */
export const useFlagOverlayNavigation = () => {
  // First create an unleash flag, this is a placeholder.
  // const { isEnabled } = useFlag('DATA_EXPLORATION_overlay_navigation', {
  //   forceRerender: true,
  //   fallback: false,
  // });

  // return isEnabled;
  return true;
};
