import React, { FunctionComponent, PropsWithoutRef } from 'react';
import styled from 'styled-components';
import { parseCron } from 'utils/cronUtils';
import InteractiveCopy from 'components/InteractiveCopy/InteractiveCopy';
import { StyledTooltip } from 'components/styled';
import { useTranslation } from 'common';
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
  const { t } = useTranslation();

  if (!schedule) {
    return <ScheduleSpan>{t('not-defined')}</ScheduleSpan>;
  }

  if (
    schedule.toLowerCase() === SupportedScheduleStrings.ON_TRIGGER.toLowerCase()
  ) {
    return <ScheduleSpan>{t('on-trigger')}</ScheduleSpan>;
  }

  if (
    schedule.toLowerCase() === SupportedScheduleStrings.CONTINUOUS.toLowerCase()
  ) {
    return <ScheduleSpan>{t('continuous')}</ScheduleSpan>;
  }

  let parsedExpression = schedule;
  try {
    parsedExpression = parseCron(schedule ?? '');
  } catch (e) {
    const errorMessage = `Schedule: "${schedule}" - ${e}`;
    return (
      <StyledTooltip content={errorMessage}>
        <i>{t('not-valid')}</i>
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

export default Schedule;
