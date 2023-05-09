import { Colors } from '@cognite/cogs.js';
import React from 'react';

import styled from 'styled-components';

import {
  DailyLogAggregation,
  doesLogHaveErrorType,
  doesLogHaveSuccessType,
} from 'utils/hostedExtractors';

type SourceStatusDailyProps = {
  aggregation: DailyLogAggregation;
};

export const SourceStatusDaily = ({
  aggregation,
}: SourceStatusDailyProps): JSX.Element => {
  if (aggregation.logs.length === 0) {
    return <AggregationItemNoData />;
  }

  if (aggregation.logs.some((log) => doesLogHaveErrorType(log))) {
    return <AggregationItemError />;
  }

  if (aggregation.logs.every((log) => doesLogHaveSuccessType(log))) {
    return <AggregationItemSuccess />;
  }

  return <AggregationItemUnknown />;
};

const AggregationItemBase = styled.button`
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
  height: 32px;
  padding: 0;
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
