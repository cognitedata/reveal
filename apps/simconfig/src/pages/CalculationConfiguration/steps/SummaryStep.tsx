import { CalculationSummary } from '@simint-app/components/calculation/CalculationSummary';
import { useFormikContext } from 'formik';

import type { CalculationTemplate } from '@cognite/simconfig-api-sdk/rtk';

export function SummaryStep() {
  const { values } = useFormikContext<CalculationTemplate>();

  return <CalculationSummary configuration={values} />;
}
