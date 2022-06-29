import React from 'react';

import { PerfMetrics } from '@cognite/metrics';

import { Loading } from 'components/Loading/Loading';
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <PerformanceMetricsObserver onChange={handlePerformanceObserved}>
      <TrajectoryGraph data={data} />
    </PerformanceMetricsObserver>
  );
};

export default Trajectory;
