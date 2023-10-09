import { cloneDeep } from 'lodash';

import { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

export const removeGroupFromCalculation = (
  calculation: UserDefined,
  orderToRemove: number
) => {
  const clonedCalculation = cloneDeep(calculation);

  if (!clonedCalculation.routine) {
    return clonedCalculation;
  }

  // remove group's steps' input/output entries first (input constant or time series)
  const groupToRemove = clonedCalculation.routine.find(
    (group) => group.order === orderToRemove
  );
  groupToRemove?.steps.forEach((step) => {
    if (step.arguments.type === 'inputTimeSeries') {
      clonedCalculation.inputTimeSeries =
        clonedCalculation.inputTimeSeries.filter(
          (inputTimeSeries) => inputTimeSeries.type !== step.arguments.value
        );
    }

    if (step.arguments.type === 'outputTimeSeries') {
      clonedCalculation.outputTimeSeries =
        clonedCalculation.outputTimeSeries.filter(
          (outputTimeSeries) => outputTimeSeries.type !== step.arguments.value
        );
    }

    if (step.arguments.type === 'inputConstant') {
      clonedCalculation.inputConstants =
        clonedCalculation.inputConstants.filter(
          (inputConstant) => inputConstant.type !== step.arguments.value
        );
    }
  });

  // remove group
  clonedCalculation.routine = clonedCalculation.routine
    .filter((routine) => routine.order !== orderToRemove)
    .map((routine, index) => ({ ...routine, order: index + 1 }));

  return clonedCalculation;
};

export const removeStepFromCalculation = (
  calculation: UserDefined,
  groupOrder: number,
  stepOrder: number
) => {
  const clonedCalculation = cloneDeep(calculation);

  if (clonedCalculation.routine) {
    const { routine } = clonedCalculation;
    const stepRoutine = routine[groupOrder - 1];
    const currentStep = stepRoutine.steps.find(
      (step) => step.step === stepOrder
    );

    if (currentStep?.arguments.type) {
      if (currentStep.arguments.type === 'inputTimeSeries') {
        clonedCalculation.inputTimeSeries =
          clonedCalculation.inputTimeSeries.filter(
            (ts) => ts.type !== currentStep.arguments.value
          );
      }

      if (currentStep.arguments.type === 'outputTimeSeries') {
        clonedCalculation.outputTimeSeries =
          clonedCalculation.outputTimeSeries.filter(
            (ts) => ts.type !== currentStep.arguments.value
          );
      }

      if (currentStep.arguments.type === 'inputConstant') {
        clonedCalculation.inputConstants =
          clonedCalculation.inputConstants.filter(
            (inputConstant) =>
              inputConstant.type !== currentStep.arguments.value
          );
      }

      stepRoutine.steps = stepRoutine.steps
        .filter((step) => step.step !== stepOrder)
        .map((step, index) => ({ ...step, step: index + 1 }));

      return clonedCalculation;
    }
  }

  return calculation;
};
