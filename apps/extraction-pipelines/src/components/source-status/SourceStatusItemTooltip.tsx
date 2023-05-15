import { Tooltip } from '@cognite/cogs.js';
import React from 'react';
import { DailyLogAggregation } from 'utils/hostedExtractors';
import SourceStatusItemTooltipContent from './SourceStatusItemTooltipContent';
import { MQTTSourceWithJobMetrics } from 'hooks/hostedExtractors';

type SourceStatusItemTooltipProps = {
  children: React.ReactElement<any>;
  aggregation: DailyLogAggregation;
  source: MQTTSourceWithJobMetrics;
};

const SourceStatusItemTooltip = ({
  children,
  aggregation,
  source,
}: SourceStatusItemTooltipProps): JSX.Element => {
  return (
    <div css={{ flex: 1 }}>
      <Tooltip
        content={
          <SourceStatusItemTooltipContent
            aggregation={aggregation}
            source={source}
          />
        }
        position="top"
      >
        {children}
      </Tooltip>
    </div>
  );
};

export default SourceStatusItemTooltip;
