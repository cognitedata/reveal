import { SelectBox, StepsContainer } from '../../elements';

import { OpenServerAddress, StepType, Variable } from './Fields';
import type { StepCommandProps } from './utils';

export function Get({ step, routineOrder, stepIndex }: StepCommandProps) {
  const props = { routineIndex: routineOrder, step, stepIndex };

  return (
    <div style={{ display: 'flex' }}>
      <StepsContainer>
        <SelectBox>
          <StepType {...props} />
          <Variable {...props} />
          <OpenServerAddress {...props} />
        </SelectBox>
      </StepsContainer>
    </div>
  );
}
