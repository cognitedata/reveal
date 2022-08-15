import React, { useState } from 'react';

import isEmpty from 'lodash/isEmpty';

import { PerfMetrics } from '@cognite/metrics';

import EmptyState from 'components/EmptyState';
import {
  PerformanceMetricsObserver,
  PerformanceObserved,
  trajectoryPageLoadQuery,
} from 'components/Performance';

import { TrajectoryGraph, TrajectoryGraphProps } from './Graph';
import { useTrajectoryData } from './hooks/useTrajectoryData';

export const Trajectory: React.FC = () => {
  const { data, isLoading } = useTrajectoryData();

  // https://cognitedata.atlassian.net/browse/PP-3086
  // keeping the expandedChart state here so that refreshing data doesn't close the expanded mode on remounting
  const [expandedChartIndex, setExpandedChartIndex] =
    useState<TrajectoryGraphProps['expandedChartIndex']>();

  const handlePerformanceObserved = ({ mutations }: PerformanceObserved) => {
    if (mutations) {
      PerfMetrics.findInMutation({
        ...trajectoryPageLoadQuery,
        mutations,
        callback: (_output: any) => {
          PerfMetrics.trackPerfEnd('TRAJECTORY_PAGE_LOAD');
        },
      });
    }
  };

  if (isEmpty(data)) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <PerformanceMetricsObserver onChange={handlePerformanceObserved}>
      <TrajectoryGraph
        data={data}
        expandedChartIndex={expandedChartIndex}
        setExpandedChartIndex={setExpandedChartIndex}
      />
    </PerformanceMetricsObserver>
  );
};

export default Trajectory;
