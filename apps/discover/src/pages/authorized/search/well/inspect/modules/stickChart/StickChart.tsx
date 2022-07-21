import React, { useRef } from 'react';

import isEmpty from 'lodash/isEmpty';

import { PerfMetrics } from '@cognite/metrics';

import EmptyState from 'components/EmptyState';
import {
  PerformanceMetricsObserver,
  PerformanceObserved,
} from 'components/Performance';

import { WellboreCasingsViewsWrapper } from './elements';
import { useCasingsData } from './hooks/useCasingsData';
import { WellboreCasingView } from './WellboreCasingView';

const StickChart: React.FC = () => {
  const { data, isLoading, isNptEventsLoading, isNdsEventsLoading } =
    useCasingsData();

  const scrollRef = useRef<HTMLDivElement>(null);

  const handlePerformanceObserved = ({
    mutations,
    data,
  }: PerformanceObserved) => {
    if (mutations) {
      PerfMetrics.trackPerfEnd('CASING_PAGE_LOAD');
    }
    if (isEmpty(data)) {
      PerfMetrics.trackPerfEnd('CASING_PAGE_LOAD');
    }
  };

  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <PerformanceMetricsObserver
      onChange={handlePerformanceObserved}
      data={data}
    >
      <WellboreCasingsViewsWrapper ref={scrollRef}>
        {data.map((casingsView) => (
          <WellboreCasingView
            key={`casings-view-${casingsView.wellboreName}`}
            data={casingsView}
            isNptEventsLoading={isNptEventsLoading}
            isNdsEventsLoading={isNdsEventsLoading}
          />
        ))}
      </WellboreCasingsViewsWrapper>
    </PerformanceMetricsObserver>
  );
};

export default StickChart;
