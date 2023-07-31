import { Colors, Icon } from '@cognite/cogs.js';
import { formatDate } from 'utils/date';

import { StepIconCircle, StepItem, StepText, StepTime } from './elements';

/* eslint-disable camelcase */

type StepType = {
  status: string;
  error_message: string | null;
  created_time: number;
};

const Step = ({ status, error_message, created_time }: StepType) => (
  <StepItem>
    <StepIconCircle
      bgColor={error_message ? Colors.danger.hex() : Colors.success.hex()}
      txtColor={error_message ? Colors.danger.hex() : Colors.white.hex()}
    >
      <Icon
        type={error_message ? 'WarningFilled' : 'Checkmark'}
        style={{ width: !error_message ? '65%' : 'auto' }}
      />
    </StepIconCircle>
    <StepText>
      {error_message ? (
        <span>
          {error_message} <StepTime>{formatDate(created_time)}</StepTime>
        </span>
      ) : (
        <span>{status}</span>
      )}
    </StepText>
  </StepItem>
);

export default Step;
