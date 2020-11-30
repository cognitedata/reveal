import React from 'react';
import { Tooltip } from '@cognite/cogs.js';
import moment from 'moment';

export const DATE_FORMAT: Readonly<string> = 'YYYY-MM-DD hh:mm';
interface TimeDisplayProps {
  value: number | Date;
  // eslint-disable-next-line react/require-default-props
  isEpoc?: boolean;
  relative?: boolean;
  withTooltip?: boolean;
}

export const TimeDisplay = ({
  value,
  isEpoc = false,
  relative,
  withTooltip,
}: TimeDisplayProps) => {
  if (value === undefined) {
    return null;
  }

  const absoluteTime = isEpoc
    ? moment.unix(value as number).format(DATE_FORMAT)
    : moment(value).format(DATE_FORMAT);
  const relativeTime = isEpoc
    ? moment.unix(value as number).fromNow()
    : moment(value).fromNow();

  let displayTime = absoluteTime;
  let tooltipTime = relativeTime;

  if (relative) {
    displayTime = relativeTime;
    tooltipTime = absoluteTime;
  }

  if (withTooltip) {
    return (
      <Tooltip placement="bottom" content={tooltipTime}>
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
