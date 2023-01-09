import { useFlag } from '../../environments/useFlag';
import { isFDMv3 } from './isFDMv3';

export const useTransformationsFeatureFlag = () => {
  const { isEnabled } = useFlag('DEVX_TRANSFORMATIONS_UI', {
    fallback: false,
  });

  const isFDMV3 = isFDMv3();

  // If the feature flag is disabled, hide the transformations UI.
  if (!isEnabled) {
    return false;
  }

  // If the feature flag is enabled and DMS V3 is disabled,
  // show the transformations UI.
  if (!isFDMV3) {
    return true;
  }

  // If the feature flag is enabled and DMS V3 is enabled,
  // hide the transformations UI.
  return false;
};
