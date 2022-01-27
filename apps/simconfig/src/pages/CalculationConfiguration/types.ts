import type { OptionType } from '@cognite/cogs.js';
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

export interface ScheduleStart {
  date: Date;
  dateString: string;
  timeString: string;
}

export interface ScheduleRepeat {
  count: number;
  interval: string;
  intervalOption?: ValueOptionType<string>;
  minutes: number;
}

export type ValueOptionType<T> = OptionType<T> &
  Required<Pick<OptionType<T>, 'value'>>;

export interface StepProps {
  isEditing?: boolean;
}
