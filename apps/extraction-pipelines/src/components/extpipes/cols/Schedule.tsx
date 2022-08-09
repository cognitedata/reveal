import React, { FunctionComponent, PropsWithoutRef } from 'react';
import styled from 'styled-components';
import { parseCron } from 'utils/cronUtils';
import InteractiveCopy from 'components/InteractiveCopy/InteractiveCopy';
import { StyledTooltip } from 'components/styled';

export const InteractiveCopyWrapper = styled.span`
  display: flex;
  align-items: center;
  span {
    margin-left: 0.5rem;
  }
`;
const ScheduleSpan = styled.span`
  line-height: 1.5em;
`;

interface OwnProps {
  id: string;
  schedule?: string;
}
export enum SupportedScheduleStrings {
  NOT_DEFINED = 'Not defined',
  ON_TRIGGER = 'On trigger',
  CONTINUOUS = 'Continuous',
  SCHEDULED = 'Scheduled',
}
type Props = OwnProps;

const Schedule: FunctionComponent<Props> = ({
  schedule,
  ...rest
}: PropsWithoutRef<Props>) => {
  if (!schedule) {
    return <ScheduleSpan>{SupportedScheduleStrings.NOT_DEFINED}</ScheduleSpan>;
  }
  if (
    schedule.toLowerCase() === SupportedScheduleStrings.ON_TRIGGER.toLowerCase()
  ) {
    return <ScheduleSpan>{SupportedScheduleStrings.ON_TRIGGER}</ScheduleSpan>;
  }
  if (
    schedule.toLowerCase() === SupportedScheduleStrings.CONTINUOUS.toLowerCase()
  ) {
    return <ScheduleSpan>{SupportedScheduleStrings.CONTINUOUS}</ScheduleSpan>;
  }
  let parsedExpression = schedule;
  try {
    parsedExpression = parseCron(schedule ?? '');
  } catch (e) {
    const errorMessage = `Schedule: "${schedule}" - ${e}`;
    return (
      <StyledTooltip content={errorMessage}>
        <i>Not valid</i>
      </StyledTooltip>
    );
  }
  return (
    <InteractiveCopyWrapper {...rest}>
      {parsedExpression}{' '}
      <InteractiveCopy
        showTextInTooltip
        text={schedule}
        copyType="cronExpression"
      />
    </InteractiveCopyWrapper>
  );
};

export default Schedule;
