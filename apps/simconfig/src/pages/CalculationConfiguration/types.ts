import type { CalculationTemplate } from '@cognite/simconfig-api-sdk/rtk';

import type { FormikErrors } from 'formik';

export interface ConfigurationStepProps<T = Partial<CalculationTemplate>> {
  values: T;
  setFieldValue: (
    field: string,
    value: unknown,
    shouldValidate?: boolean
  ) => Promise<FormikErrors<T>> | Promise<void>;
}
