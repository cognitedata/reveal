import type { OptionType } from '@cognite/cogs.js';
import type {
  CalculationStep,
  InputTimeSeries,
  UserDefined,
} from '@cognite/simconfig-api-sdk/rtk';

import type { DragControls } from 'framer-motion';

export interface StepCommandProps {
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

export const getTimeSerieIndexByType = (
  inputs: InputTimeSeries[],
  type: string
) => inputs.findIndex((timeserie) => timeserie.type === type);
