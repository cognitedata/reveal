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

type Props = OwnProps;

const Schedule: FunctionComponent<Props> = ({ schedule, ...rest }: Props) => {
  switch (schedule) {
    case undefined:
      return <span>Not defined</span>;
    case 'On Trigger':
      return <span>{schedule}</span>;
    default:
      return (
        <Tooltip content={schedule}>
          <InteractiveCopyWrapper {...rest}>
            {parseCron(schedule)} <InteractiveCopy text={schedule} />
          </InteractiveCopyWrapper>
        </Tooltip>
      );
  }
};

Schedule.defaultProps = {
  schedule: undefined,
};

export default Schedule;
