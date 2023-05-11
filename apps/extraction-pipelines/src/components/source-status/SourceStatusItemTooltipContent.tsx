import React from 'react';
import { formatTime } from '@cognite/cdf-utilities';
import { Body, Flex } from '@cognite/cogs.js';
import styled from 'styled-components';
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
    <StyledTooltipContent direction="column" gap={8}>
      <StyledTooltipBody level={3}>{content()}</StyledTooltipBody>
    </StyledTooltipContent>
  );
};

const StyledTooltipContent = styled(Flex)`
  padding: 16px;
`;

const StyledTooltipBody = styled(Body)`
  color: var(--cogs-text-icon--muted);
`;

export default SourceStatusItemTooltipContent;
