import { Tooltip } from '@cognite/cogs.js';
import React from 'react';
import { DailyLogAggregation } from 'utils/hostedExtractors';
import SourceStatusItemTooltipContent from './SourceStatusItemTooltipContent';

type SourceStatusItemTooltipProps = {
  children: React.ReactElement<any>;
  aggregation: DailyLogAggregation;
};

const SourceStatusItemTooltip = ({
  children,
  aggregation,
}: SourceStatusItemTooltipProps): JSX.Element => {
  return (
    <Tooltip
      content={<SourceStatusItemTooltipContent aggregation={aggregation} />}
      position="bottom"
    >
      {children}
    </Tooltip>
  );
};

export default SourceStatusItemTooltip;
