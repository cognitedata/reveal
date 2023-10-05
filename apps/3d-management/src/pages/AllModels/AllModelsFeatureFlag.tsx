import { useFlag } from '@cognite/react-feature-flags';

import { AllModels as AllModelsThreeD } from './AllModels';
import { AllModels as AllModelsThreeSixty } from './AllModelsThreeSixty';
export const AllModels = () => {
  const { isEnabled: isThreeSixtyContextualizaFeatureFlagEnabled } = useFlag(
    '3D_MANAGEMENT_threesixty_contextualization'
  );

  return isThreeSixtyContextualizaFeatureFlagEnabled ? (
    <AllModelsThreeSixty />
  ) : (
    <AllModelsThreeD />
  );
};
