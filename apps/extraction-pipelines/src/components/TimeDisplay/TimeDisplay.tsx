import React from 'react';
import { Tooltip } from '@cognite/cogs.js';
import moment from 'moment';

export const DATE_FORMAT: Readonly<string> = 'YYYY-MM-DD hh:mm';
interface TimeDisplayProps {
  value: number | Date;
  relative?: boolean;
  withTooltip?: boolean;
}

export const TimeDisplay = ({
  value,
  relative,
  withTooltip,
}: TimeDisplayProps) => {
  if (value === undefined) {
    return null;
  }

  const absoluteTime = moment(value).format(DATE_FORMAT);
  const relativeTime = moment(value).fromNow();

  let displayTime = absoluteTime;
  let tooltipTime = relativeTime;

  if (relative) {
    displayTime = relativeTime;
    tooltipTime = absoluteTime;
  }

  if (withTooltip) {
    return (
      <Tooltip placement="top" content={tooltipTime}>
        <>{displayTime}</>
      </Tooltip>
    );
  }

  return <>{absoluteTime}</>;
};

TimeDisplay.defaultProps = {
  relative: false,
  withTooltip: false,
};
