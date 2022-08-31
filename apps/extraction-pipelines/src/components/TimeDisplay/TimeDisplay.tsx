import React from 'react';
import moment from 'moment';
import { StyledTooltip } from 'components/styled';

export const DATE_FORMAT: Readonly<string> = 'YYYY-MM-DD';
export const DATE_TIME_FORMAT: Readonly<string> = 'YYYY-MM-DD HH:mm:ss';
export interface TimeDisplayProps {
  value: number | Date;
  relative?: boolean;
  withTooltip?: boolean;
}

export const TimeDisplay = ({
  value,
  relative,
  withTooltip,
}: TimeDisplayProps) => {
  if (value == null || value === 0) {
    return null;
  }

  const absoluteTime = moment(value).format(DATE_TIME_FORMAT);
  const relativeTime = moment(value).fromNow();

  let displayTime = absoluteTime;
  let tooltipTime = relativeTime;

  if (relative) {
    displayTime = relativeTime;
    tooltipTime = absoluteTime;
  }

  if (withTooltip) {
    return (
      <StyledTooltip placement="top" content={tooltipTime}>
        <>{displayTime}</>
      </StyledTooltip>
    );
  }

  return <>{displayTime}</>;
};

TimeDisplay.defaultProps = {
  relative: false,
  withTooltip: false,
};
