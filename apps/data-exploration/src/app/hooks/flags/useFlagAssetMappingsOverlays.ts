import { useFlag } from '@cognite/react-feature-flags';

/**
 * Flag used for enabling asset mappings overlays in 3D viewer.
 *
 */
export const useFlagAssetMappingsOverlays = () => {
  const { isEnabled } = useFlag('DATA_EXPLORATION_3D_asset_mappings_overlays', {
    forceRerender: true,
    fallback: false,
  });

  return isEnabled;
};
