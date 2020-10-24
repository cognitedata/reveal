import React from 'react';
import { Colors, Icon } from '@cognite/cogs.js';
import { format } from 'date-fns';
import { UNIX_TIMESTAMP_FACTOR } from 'typings/interfaces';
import { StepIconCircle, StepItem, StepText, StepTime } from './elements';

/* eslint-disable camelcase */

type StepType = {
  status: string;
  error_message: string | null;
  created_time: number;
};

const Step = ({ status, error_message, created_time }: StepType) => {
  return (
    <StepItem key={`${status}-${created_time}`}>
      <StepIconCircle
        bgColor={error_message ? Colors.danger.hex() : Colors.success.hex()}
        txtColor={error_message ? Colors.danger.hex() : Colors.white.hex()}
      >
        <Icon
          type={error_message ? 'WarningFilled' : 'Check'}
          style={{ width: !error_message ? '65%' : 'auto' }}
        />
      </StepIconCircle>
      <StepText>
        {error_message ? (
          <span>
            {error_message}{' '}
            <StepTime>
              {format(new Date(created_time * UNIX_TIMESTAMP_FACTOR), 'Pp')}
            </StepTime>
          </span>
        ) : (
          <span>{status}</span>
        )}
      </StepText>
    </StepItem>
  );
};

export default Step;
