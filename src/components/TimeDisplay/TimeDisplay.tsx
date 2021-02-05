import React from 'react';
import { Tooltip } from '@cognite/cogs.js';
import moment from 'moment';

interface TimeDisplayProps {
  value?: number | Date;
  relative?: boolean;
  withTooltip?: boolean;
}

export const TimeDisplay = ({
  value,
  relative = false,
  withTooltip = false,
}: TimeDisplayProps) => {
  if (value === undefined) {
    return <em>Not set</em>;
  }

  const absoluteTime = moment(value).format('YYYY-MM-DD HH:mm');
  const relativeTime = moment(value).fromNow();

  let displayTime = absoluteTime;
  let tooltipTime = relativeTime;

  if (relative) {
    displayTime = relativeTime;
    tooltipTime = absoluteTime;
  }

  if (withTooltip) {
    return (
      <Tooltip interactive placement="bottom" content={tooltipTime}>
        <>{displayTime}</>
      </Tooltip>
    );
  }

  return <>{absoluteTime}</>;
};
