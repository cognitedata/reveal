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
    <div style={{ flex: 1 }}>
      <Tooltip
        content={<SourceStatusItemTooltipContent aggregation={aggregation} />}
        position="top"
      >
        {children}
      </Tooltip>
    </div>
  );
};

export default SourceStatusItemTooltip;
