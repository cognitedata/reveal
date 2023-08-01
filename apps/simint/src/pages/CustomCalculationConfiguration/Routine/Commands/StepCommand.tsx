import { useFormikContext } from 'formik';

import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { Command as CommandStep } from './Command';
import { Get as GetCommand } from './Get';
import { Set as SetCommand } from './Set';
import type { StepCommandProps } from './utils';
import { getRoutineIndex, getStepIndex } from './utils';

const CommandMap = {
  Get: GetCommand,
  Command: CommandStep,
  Set: SetCommand,
};

export function StepCommand({
  step,
  routineOrder,
}: Omit<StepCommandProps, 'stepIndex'>) {
  const { values } = useFormikContext<UserDefined>();

  if (!values.routine) {
    return null;
  }

  const StepCmd = CommandMap[step.type];
  const stepOrder = step.step;

  const routineIndex = getRoutineIndex(values, routineOrder);
  const stepIndex = getStepIndex(values, routineIndex, stepOrder);

  return (
    <StepCmd routineOrder={routineIndex} step={step} stepIndex={stepIndex} />
  );
}
