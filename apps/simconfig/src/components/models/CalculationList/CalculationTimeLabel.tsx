import styled from 'styled-components/macro';

import { Icon, Tooltip } from '@cognite/cogs.js';

import type { DateType } from 'utils/timeUtils';
import {
  formatCalculationDate,
  formatCalculationDuration,
} from 'utils/timeUtils';

interface CalculationTimeLabelProps {
  calcTime?: DateType;
  createdTime?: DateType;
  endTime?: DateType;
  lastUpdatedTime?: DateType;
  startTime?: DateType;
  displayTime?: DateType;
}

export function CalculationTimeLabel({
  calcTime,
  createdTime,
  endTime,
  lastUpdatedTime,
  startTime,
  displayTime = lastUpdatedTime,
}: CalculationTimeLabelProps) {
  if (!displayTime) {
    return null;
  }

  return (
    <CalculationTimeLabelTooltip
      content={
        <dl key={`time-label-${displayTime.toString()}`}>
          {lastUpdatedTime ? (
            <>
              <dt>Simulation event created</dt>
              <dd>{formatCalculationDate(lastUpdatedTime)}</dd>
            </>
          ) : null}

          {endTime && createdTime ? (
            <>
              <dt>Total duration</dt>
              <dd>{formatCalculationDuration(endTime, createdTime)}</dd>
            </>
          ) : null}
          {startTime ? (
            <>
              <dt>Simulation started</dt>
              <dd>{formatCalculationDate(startTime)}</dd>
            </>
          ) : null}
          {endTime && startTime ? (
            <>
              <dt>Simulation duration</dt>
              <dd>{formatCalculationDuration(endTime, startTime)}</dd>
            </>
          ) : null}
          {calcTime ? (
            <>
              <dt>Calculation time</dt>
              <dd>{formatCalculationDate(calcTime)}</dd>
            </>
          ) : null}
        </dl>
      }
    >
      <>
        <Icon type="Clock" /> {formatCalculationDate(displayTime)}
      </>
    </CalculationTimeLabelTooltip>
  );
}

const CalculationTimeLabelTooltip = styled(Tooltip)`
  dl,
  dt,
  dd {
    margin: 0;
    padding: 0;
    white-space: nowrap;
  }
  dt {
    &:not(:first-child) {
      margin-top: 12px;
    }
  }
`;
