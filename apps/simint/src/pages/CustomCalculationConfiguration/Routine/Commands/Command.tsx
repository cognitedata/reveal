import { SelectBox, StepsContainer } from '../../elements';

import { OpenServerAddress, StepType } from './Fields';
import type { StepCommandProps } from './utils';

export function Command({ step, routineOrder, stepIndex }: StepCommandProps) {
  const props = { routineIndex: routineOrder, step, stepIndex };

  return (
    <div style={{ display: 'flex' }}>
      <StepsContainer>
        <SelectBox>
          <StepType {...props} />
          <OpenServerAddress {...props} />
        </SelectBox>
      </StepsContainer>
    </div>
  );
}
