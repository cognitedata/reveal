import { SelectBox, StepsContainer } from '../../elements';

import { StepType, DynamicFields } from './Fields';
import type { StepCommandProps } from './utils';

export function Command({
  dynamicStepFields,
  step,
  routineOrder,
  stepIndex,
}: StepCommandProps) {
  const props = {
    routineIndex: routineOrder,
    step,
    stepIndex,
    dynamicStepFields,
  };

  return (
    <div style={{ display: 'flex' }}>
      <StepsContainer>
        <SelectBox>
          <StepType {...props} />
          <DynamicFields {...props} />
        </SelectBox>
      </StepsContainer>
    </div>
  );
}
