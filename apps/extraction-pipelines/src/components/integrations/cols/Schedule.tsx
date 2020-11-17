import { Tooltip } from '@cognite/cogs.js';
import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { parseCron } from '../../../utils/cronUtils';
import InteractiveCopy from '../../InteractiveCopy';

const FlexWrapper = styled.span`
  display: flex;
  align-items: center;
  span {
    margin-left: 0.5rem;
  }
`;

interface OwnProps {
  schedule?: string;
}

type Props = OwnProps;

const Schedule: FunctionComponent<Props> = ({ schedule }: Props) => {
  switch (schedule) {
    case undefined:
      return <>Not defined</>;
    case 'On Trigger':
      return <>{schedule}</>;
    default:
      return (
        <>
          <Tooltip content={schedule}>
            <FlexWrapper>
              {parseCron(schedule)} <InteractiveCopy text={schedule} />
            </FlexWrapper>
          </Tooltip>
        </>
      );
  }
};

Schedule.defaultProps = {
  schedule: undefined,
};

export default Schedule;
