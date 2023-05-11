import React from 'react';
import { formatTime } from '@cognite/cdf-utilities';
import { Flex } from '@cognite/cogs.js';
import { DailyLogAggregation } from 'utils/hostedExtractors';

type SourceStatusItemTooltipContentProps = {
  aggregation: DailyLogAggregation;
};

const SourceStatusItemTooltipContent = ({
  aggregation,
}: SourceStatusItemTooltipContentProps): JSX.Element => {
  const content = () => {
    if (aggregation.logs.length === 0) {
      return 'No Data';
    } else {
      return formatTime(aggregation.date);
    }
  };
  return (
    <Flex direction="column" gap={8}>
      {content()}
    </Flex>
  );
};

export default SourceStatusItemTooltipContent;
