import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import { TransformationRead } from '@transformations/types';

import { Colors, Icon } from '@cognite/cogs.js';

type TransformationScheduleProps = {
  blocked: TransformationRead['blocked'];
  schedule: TransformationRead['schedule'];
};

const TransformationSchedule = ({
  blocked,
  schedule,
}: TransformationScheduleProps): JSX.Element => {
  const { t } = useTranslation();

  if (blocked) {
    return (
      <StyledTransformationScheduleContainer $isBlocked>
        <StyledScheduleIcon type="WarningFilled" />
        {t('schedule-blocked')}
      </StyledTransformationScheduleContainer>
    );
  }

  if (!schedule) {
    return (
      <StyledTransformationScheduleContainer>
        <StyledScheduleIcon type="Remove" />
        {t('schedule-not-scheduled')}
      </StyledTransformationScheduleContainer>
    );
  }

  if (schedule.isPaused) {
    return (
      <StyledTransformationScheduleContainer>
        <StyledScheduleIcon type="Pause" />
        {t('schedule-paused')}
      </StyledTransformationScheduleContainer>
    );
  }

  return (
    <StyledTransformationScheduleContainer>
      <StyledScheduleIcon type="Clock" />
      {schedule.interval}
    </StyledTransformationScheduleContainer>
  );
};

const StyledTransformationScheduleContainer = styled.div<{
  $isBlocked?: boolean;
}>`
  align-items: center;
  color: ${({ $isBlocked }) =>
    $isBlocked && Colors['text-icon--status-critical']};
  display: flex;
`;

const StyledScheduleIcon = styled(Icon)`
  margin-right: 12px;
`;

export default TransformationSchedule;
