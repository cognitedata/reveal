import { useFlag } from '@cognite/react-feature-flags';

/**
 * Flag used for enabling asset mappings overlays in 3D viewer.
 *
 */
export const useFlagFileCategorization = () => {
  const { isEnabled } = useFlag('DATA_EXPLORATION_document_categorisation', {
    forceRerender: true,
    fallback: false,
  });

  return isEnabled;
};
