import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { PerfMetrics } from '@cognite/metrics';

import {
  PerformanceMetricsObserver,
  PerformanceObserved,
} from 'components/Performance';

import { CasingsView } from '../types';

import { WellboreCasingsViewsWrapper } from './elements';
import { WellboreCasingsView } from './WellboreCasingsView';

interface CasingsGraphProps {
  data: CasingsView[];
  scrollRef: React.RefObject<HTMLDivElement>;
  isNptEventsLoading?: boolean;
  isNdsEventsLoading?: boolean;
  showBothSides?: boolean;
}

export const CasingsGraph: React.FC<CasingsGraphProps> = ({
  data,
  scrollRef,
  isNptEventsLoading,
  isNdsEventsLoading,
  showBothSides = false,
}) => {
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

  return (
    <PerformanceMetricsObserver
      onChange={handlePerformanceObserved}
      data={data}
    >
      <WellboreCasingsViewsWrapper ref={scrollRef}>
        {data.map((casingsView) => (
          <WellboreCasingsView
            key={`casings-view-${casingsView.wellboreName}`}
            data={casingsView}
            isNptEventsLoading={isNptEventsLoading}
            isNdsEventsLoading={isNdsEventsLoading}
            showBothSides={showBothSides}
          />
        ))}
      </WellboreCasingsViewsWrapper>
    </PerformanceMetricsObserver>
  );
};
