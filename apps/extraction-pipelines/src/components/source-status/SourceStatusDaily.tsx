import { Colors } from '@cognite/cogs.js';
import React from 'react';

import styled from 'styled-components';

import {
  DailyLogAggregation,
  doesLogHaveErrorType,
  doesLogHaveSuccessType,
  AggregationInterval,
} from 'utils/hostedExtractors';

import SourceStatusItemTooltip from './SourceStatusItemTooltip';

type SourceStatusDailyProps = {
  aggregation: DailyLogAggregation;
  aggregationInterval: AggregationInterval;
};

export const SourceStatusDaily = ({
  aggregation,
  aggregationInterval,
}: SourceStatusDailyProps): JSX.Element => {
  const sourceStatusItemWidth =
    aggregationInterval === 'hourly' ? '5px' : '18px';
  if (aggregation.logs.length === 0) {
    return (
      <SourceStatusItemTooltip aggregation={aggregation}>
        <AggregationItemNoData style={{ width: sourceStatusItemWidth }} />
      </SourceStatusItemTooltip>
    );
  }
  if (aggregation.logs.some((log) => doesLogHaveErrorType(log))) {
    return (
      <SourceStatusItemTooltip aggregation={aggregation}>
        <AggregationItemError style={{ width: sourceStatusItemWidth }} />
      </SourceStatusItemTooltip>
    );
  }
  if (aggregation.logs.every((log) => doesLogHaveSuccessType(log))) {
    return (
      <SourceStatusItemTooltip aggregation={aggregation}>
        <AggregationItemSuccess style={{ width: sourceStatusItemWidth }} />
      </SourceStatusItemTooltip>
    );
  }
  return (
    <SourceStatusItemTooltip aggregation={aggregation}>
      <AggregationItemUnknown style={{ width: sourceStatusItemWidth }} />
    </SourceStatusItemTooltip>
  );
};


const AggregationItemBase = styled.div`
  border: none;
  border-radius: 4px;
  cursor: pointer;
  height: 32px;
  padding: 0;
  display: block;
`;

const AggregationItemUnknown = styled(AggregationItemBase)`
  background-color: ${Colors['surface--status-undefined--strong--default']};

  :hover {
    background-color: ${Colors['surface--status-undefined--strong--hover']};
  }

  :active {
    background-color: ${Colors['surface--status-undefined--strong--pressed']};
  }
`;

const AggregationItemNoData = styled(AggregationItemBase)`
  background-color: ${Colors['surface--status-undefined--muted--default']};
  cursor: unset;

  :hover {
    background-color: ${Colors['surface--status-undefined--muted--hover']};
  }
`;

const AggregationItemError = styled(AggregationItemBase)`
  background-color: ${Colors['surface--status-critical--strong--default']};

  :hover {
    background-color: ${Colors['surface--status-critical--strong--hover']};
  }

  :active {
    background-color: ${Colors['surface--status-critical--strong--pressed']};
  }
`;

const AggregationItemSuccess = styled(AggregationItemBase)`
  background-color: ${Colors['decorative--green--400']};

  :hover {
    background-color: ${Colors['decorative--green--500']};
  }

  :active {
    background-color: ${Colors['decorative--green--600']};
  }
`;
