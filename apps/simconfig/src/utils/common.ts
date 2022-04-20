import type {
  AdditionalMetadata,
  CalculationTemplate,
  Metadata,
  Simulator,
} from '@cognite/simconfig-api-sdk/rtk';

import { ROUGH_APPROXIMATION } from 'components/app/constants';

export const isBHPApproxMethodWarning = (
  simulator: Simulator,
  metadata: AdditionalMetadata & Metadata,
  calculationConfig: CalculationTemplate
): boolean => {
  const { calculationType } = calculationConfig;
  const warningCalcTypes = ['BhpFromGaugeBhp', 'BhpFromRate', 'VLP'];

  if (simulator !== 'PROSPER') {
    return false;
  }

  // Check if Temperature Model is Rough Approximation
  if (
    metadata['Temperature Model'] &&
    metadata['Temperature Model'] === ROUGH_APPROXIMATION
  ) {
    return false;
  }

  // When calculationType is either BhpFromGaugeBhp, BhpFromRate or VLP then give warning
  if (warningCalcTypes.includes(calculationType)) {
    return true;
  }

  // when calculationType is IPR, check for additional condition wrt to estimateBHP then give warning
  if (calculationType === 'IPR') {
    const {
      estimateBHP: { enabled: isEstimateBHPEnabled, method },
    } = calculationConfig;
    if (
      isEstimateBHPEnabled &&
      ['LiftCurveGaugeBhp', 'LiftCurveRate'].includes(method)
    ) {
      return true;
    }
  }

  // For calcTypes not part of BhpFromGaugeBhp, BhpFromRate, VLP or IPR, no need for warning
  return false;
};
