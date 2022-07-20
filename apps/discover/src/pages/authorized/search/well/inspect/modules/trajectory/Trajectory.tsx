import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { PerfMetrics } from '@cognite/metrics';

import EmptyState from 'components/EmptyState';
import {
  PerformanceMetricsObserver,
  PerformanceObserved,
  trajectoryPageLoadQuery,
} from 'components/Performance';

import { TrajectoryGraph } from './Graph';
import { useTrajectoryData } from './hooks/useTrajectoryData';

export const Trajectory: React.FC = () => {
  const { data, isLoading } = useTrajectoryData();

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
      <TrajectoryGraph data={data} />
    </PerformanceMetricsObserver>
  );
};

export default Trajectory;
