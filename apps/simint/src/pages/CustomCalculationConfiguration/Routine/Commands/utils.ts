import type { DragControls } from 'framer-motion';

import type { OptionType } from '@cognite/cogs.js';
import type {
  CalculationStep,
  StepFields,
  InputConstant,
  InputTimeSeries,
  OutputTimeSeries,
  UserDefined,
} from '@cognite/simconfig-api-sdk/rtk';

export interface StepCommandProps {
  dynamicStepFields: StepFields;
  step: CalculationStep;
  routineOrder: number;
  index?: number;
  updateDragControls?: (idx: string, dragControl: DragControls) => void;
  stepIndex: number;
  routineIndex?: number;
}

export interface ConfigurationFieldProps {
  routineIndex: number;
  step: CalculationStep;
  stepIndex: number;
}

export interface TimeSeriesPrefixProps {
  timeSeriesPrefix: 'inputTimeSeries' | 'outputTimeSeries' | 'inputConstants';
}

export type ValueOptionType<T> = OptionType<T> &
  Required<Pick<OptionType<T>, 'value'>>;

export const ACTION_OPTIONS: ValueOptionType<string>[] = [
  { label: 'Set', value: 'Set' },
  { label: 'Get', value: 'Get' },
  { label: 'Command', value: 'Command' },
];

export const getOptionLabel = (
  options: ValueOptionType<string>[],
  target: string
) => options.find((option) => option.value === target)?.label;

export const getRoutineIndex = (values: UserDefined, routineOrder: number) => {
  if (!values.routine) {
    return 0;
  }
  return values.routine.findIndex((routine) => routine.order === routineOrder);
};

export const getStepIndex = (
  values: UserDefined,
  routineIndex: number,
  stepOrder: number
) => {
  if (!values.routine) {
    return 0;
  }
  return values.routine[routineIndex].steps.findIndex(
    (step) => step.step === stepOrder
  );
};

export const getInputOutputIndex = (
  bucket: InputTimeSeries[] | OutputTimeSeries[] | InputConstant[],
  value: string
) => {
  const index = bucket.findIndex((bucketEntry) => bucketEntry.type === value);

  // when the index is not found, it means that the step is a new one
  // which means that the index is the last and current one
  // if the index is found, it will overwrite the found index
  return {
    index: index === -1 ? bucket.length : index,
    didFindEntry: index !== -1,
  };
};
