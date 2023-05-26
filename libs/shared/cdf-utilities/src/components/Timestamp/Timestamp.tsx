import * as React from 'react';

import { CogsTooltipProps, Icon, Tooltip } from '@cognite/cogs.js';

import { TOOLTIP_DELAY_IN_MS } from '../../common';
import { formatTime, getDetailedTime } from '../../utils';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries

type TimestampProps = {
  absolute?: boolean;
  appendTo?: CogsTooltipProps['appendTo'];
  formatContent?: (timestamp: number) => string;
  formatTooltip?: (timestamp: number) => string;
  timestamp?: number;
  hideTooltip?: boolean;
};

const Timestamp: React.FC<TimestampProps> = ({
  absolute,
  appendTo,
  formatContent,
  formatTooltip,
  timestamp,
  hideTooltip = false,
}: TimestampProps) => {
  if (!timestamp) {
    return <Icon type="Remove" />;
  }

  const time = formatContent
    ? formatContent(timestamp)
    : formatTime(timestamp, absolute);

  if (hideTooltip) {
    return <>{time}</>;
  }

  return (
    <Tooltip
      appendTo={appendTo}
      content={
        formatTooltip ? formatTooltip(timestamp) : getDetailedTime(timestamp)
      }
      delay={TOOLTIP_DELAY_IN_MS}
    >
      <>{time}</>
    </Tooltip>
  );
};

export default Timestamp;
