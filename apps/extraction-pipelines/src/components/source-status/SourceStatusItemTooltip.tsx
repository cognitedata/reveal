import { Colors, Tooltip, Elevations } from '@cognite/cogs.js';
import styled from 'styled-components';
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
    <StyledSourceStatusItemTooltipWrapper
      content={<SourceStatusItemTooltipContent aggregation={aggregation} />}
      position="bottom"
    >
      {children}
    </StyledSourceStatusItemTooltipWrapper>
  );
};

const StyledSourceStatusItemTooltipWrapper = styled(Tooltip)`
  && {
    background-color: ${Colors['surface--muted']};
    border-radius: 12px;
    box-shadow: ${Elevations['elevation--overlay']};

    .tippy-svg-arrow {
      fill: ${Colors['surface--muted']};
      stroke: ${Colors['surface--muted']};
    }
  }

  max-width: 370px !important; /* overrides cogs style */
  min-width: 200px;

  .tippy-content {
    background-color: ${Colors['surface--muted']};
    border-radius: 12px;
    padding: 0;
  }
`;

export default SourceStatusItemTooltip;
