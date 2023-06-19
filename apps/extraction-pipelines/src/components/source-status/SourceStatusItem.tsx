import React from 'react';

import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';

import { UptimeAggregation } from '../../utils/hostedExtractors';

import SourceStatusItemTooltip from './SourceStatusItemTooltip';

type SourceStatusItemProps = {
  aggregation: UptimeAggregation;
};

const renderItem = (uptimePercentage: number) => {
  if (uptimePercentage === 100) {
    return <AggregationItemSuccess />;
  }

  if (uptimePercentage >= 99.5) {
    return <AggregationItemWarning />;
  }

  if (uptimePercentage === -1) {
    return <AggregationItemNoData />;
  }

  return <AggregationItemError />;
};

export const SourceStatusItem = ({
  aggregation,
}: SourceStatusItemProps): JSX.Element => {
  return (
    <div style={{ flex: 1 }}>
      <SourceStatusItemTooltip aggregation={aggregation}>
        {renderItem(aggregation.uptimePercentage)}
      </SourceStatusItemTooltip>
    </div>
  );
};

const AggregationItemBase = styled.button`
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: block;
  height: 32px;
  padding: 0;
  width: 100%;
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

const AggregationItemWarning = styled(AggregationItemBase)`
  background-color: ${Colors['decorative--yellow--500']};

  :hover {
    background-color: ${Colors['decorative--yellow--600']};
  }

  :active {
    background-color: ${Colors['decorative--yellow--700']};
  }
`;
