import { Tooltip } from '@cognite/cogs.js';
import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { parseCron } from '../../../utils/cronUtils';
import InteractiveCopy from '../../InteractiveCopy';

export const InteractiveCopyWrapper = styled.span`
  display: flex;
  align-items: center;
  span {
    margin-left: 0.5rem;
  }
`;

interface OwnProps {
  id: string;
  schedule?: string;
}
export enum SupportedScheduleStrings {
  NOT_DEFINED = 'Not defined',
  ON_TRIGGER = 'On Trigger',
  CONTINUOUS = 'Continuous',
  SCHEDULED = 'Scheduled',
}
type Props = OwnProps;

const Schedule: FunctionComponent<Props> = ({ schedule, ...rest }: Props) => {
  switch (schedule) {
    case undefined:
      return <span>{SupportedScheduleStrings.NOT_DEFINED}</span>;
    case SupportedScheduleStrings.ON_TRIGGER:
    case SupportedScheduleStrings.CONTINUOUS:
      return <span>{schedule}</span>;
    default: {
      let parsedExpression = schedule;
      try {
        parsedExpression = parseCron(schedule ?? '');
      } catch (e) {
        const errorMessage = `Schedule: "${schedule}" - ${e}`;
        return (
          <Tooltip content={errorMessage}>
            <i>Not valid</i>
          </Tooltip>
        );
      }
      return (
        <Tooltip content={schedule}>
          <InteractiveCopyWrapper {...rest}>
            {parsedExpression} <InteractiveCopy text={schedule} />
          </InteractiveCopyWrapper>
        </Tooltip>
      );
    }
  }
};

Schedule.defaultProps = {
  schedule: undefined,
};

export default Schedule;
