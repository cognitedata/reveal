import format from 'date-fns/format';
import formatDuration from 'date-fns/formatDuration';
import styled from 'styled-components/macro';

import { Icon } from '@cognite/cogs.js';
import type { CalculationSchedule } from '@cognite/simconfig-api-sdk/rtk';

import {
  DurationFormatMap,
  DurationKeyMap,
  isValidDuration,
} from 'utils/timeUtils';

interface CalculationScheduleIndicatorProps
  extends React.HTMLAttributes<unknown> {
  schedule: CalculationSchedule;
}

export function CalculationScheduleIndicator({
  schedule,
  ...props
}: CalculationScheduleIndicatorProps) {
  if (!schedule.enabled) {
    return (
      <CalculationScheduleIndicatorContainer className="disabled cogs-detail">
        <Icon type="Error" />
        Schedule disabled
      </CalculationScheduleIndicatorContainer>
    );
  }

  const repeatCount = parseInt(schedule.repeat, 10);
  const repeatInterval = schedule.repeat.slice(-1);
  if (!repeatCount || !isValidDuration(repeatInterval)) {
    return null;
  }
  const repeatStart = new Date(schedule.start);
  const formattedInterval = formatDuration({
    [DurationKeyMap[repeatInterval]]: repeatCount,
  });
  const formattedStart =
    DurationFormatMap[repeatInterval] &&
    format(repeatStart, DurationFormatMap[repeatInterval]);

  return (
    <CalculationScheduleIndicatorContainer {...props}>
      <Icon type="Clock" />
      Every {formattedInterval}
      {formattedStart && ` starting at ${formattedStart}`}
    </CalculationScheduleIndicatorContainer>
  );
}

const CalculationScheduleIndicatorContainer = styled.span`
  display: flex;
  align-items: center;
  column-gap: 6px;
  font-size: var(--cogs-detail-font-size);
  &.disabled {
    color: var(--cogs-text-hint);
  }
`;
