import { useFormikContext } from 'formik';

import type { CalculationTemplate } from '@cognite/simconfig-api-sdk/rtk';

import { CalculationSummary } from 'components/calculation/CalculationSummary';

export function SummaryStep() {
  const { values } = useFormikContext<CalculationTemplate>();

  return <CalculationSummary configuration={values} />;
}
