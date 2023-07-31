import type { CalculationType } from '@cognite/simconfig-api-sdk/rtk';

import { BHPFromGaugeBHPInfoDrawer } from './BHPFromGaugeBHPInfoDrawer';
import { BHPfromGradientTraverseInfoDrawer } from './BHPfromGradientTraverseInfoDrawer';
import { BHPFromRateInfoDrawer } from './BHPFromRateInfoDrawer';
import { ChokePerformanceInfoDrawer } from './ChokePerformanceInfoDrawer';
import { InflowPerformanceInfoDrawer } from './InflowPerformanceInfoDrawer';
import { LiftCurveSolutionInfoDrawer } from './LiftCurveSolutionInfoDrawer';
import { NodalAnalysisInfoDrawer } from './NodalAnalysisInfoDrawer';

export function CalculationDescriptionInfoDrawer({
  calculation,
}: {
  calculation: CalculationType;
}) {
  const calculationInfoDrawer: Partial<Record<CalculationType, JSX.Element>> = {
    'BhpFromRate': <BHPFromRateInfoDrawer />,
    'ChokeDp': <ChokePerformanceInfoDrawer />,
    'IPR': <InflowPerformanceInfoDrawer />,
    'IPR/VLP': <NodalAnalysisInfoDrawer />,
    'VLP': <LiftCurveSolutionInfoDrawer />,
    'BhpFromGradientTraverse': <BHPfromGradientTraverseInfoDrawer />,
    'BhpFromGaugeBhp': <BHPFromGaugeBHPInfoDrawer />,
  };
  return calculationInfoDrawer[calculation] ?? null;
}
