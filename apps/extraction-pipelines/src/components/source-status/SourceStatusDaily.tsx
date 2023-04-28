import { Colors } from '@cognite/cogs.js';
import React from 'react';

import styled from 'styled-components';

import {
  DailyLogAggregation,
  doesLogHaveErrorType,
} from 'utils/hostedExtractors';

type DailyAggregationType = 'critical' | 'success';

type SourceStatusDailyProps = {
  aggregation: DailyLogAggregation;
};

export const SourceStatusDaily = ({
  aggregation,
}: SourceStatusDailyProps): JSX.Element => {
  let aggregationType: DailyAggregationType | undefined;
  if (aggregation.logs.length === 0) {
    aggregationType = undefined;
  } else if (aggregation.logs.some((log) => doesLogHaveErrorType(log))) {
    aggregationType = 'critical';
  } else {
    aggregationType = 'success';
  }

  return <DailyAggregation $aggregationType={aggregationType} />;
};

const DailyAggregation = styled.button<{
  $aggregationType?: DailyAggregationType;
}>`
  background-color: ${({ $aggregationType }) =>
    $aggregationType
      ? Colors[`surface--status-${$aggregationType}--strong--default`]
      : Colors[`surface--status-${$aggregationType}--muted--default`]};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
  height: 32px;
`;
