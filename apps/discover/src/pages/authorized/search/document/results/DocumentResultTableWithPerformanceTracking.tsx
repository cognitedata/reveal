import React from 'react';

import { PerfMetrics } from '@cognite/metrics';

import { documentResultTableLoadQuery } from 'components/performance/mutationSearchQueries';

import {
  domRef,
  PerformanceMetricsObserver,
  PerformanceObserved,
} from '../../../../../components/performance/PerformanceMetricsObserver';

import { DocumentResultTable } from './DocumentResultTable';

const performanceOnRender = (ref: domRef) => {
  PerfMetrics.trackPerfEvent(
    'SEARCH_CHECKBOX_CLICKED',
    'click',
    ref,
    'input[type=checkbox]',
    1
  );
  return () => {
    PerfMetrics.untrackPerfEvent('SEARCH_CHECKBOX_CLICKED');
  };
};

const handlePerformanceObserved = ({ mutations }: PerformanceObserved) => {
  if (mutations) {
    PerfMetrics.trackPerfEnd('SEARCH_ACTION_DATA_UPDATED');
    PerfMetrics.findInMutation({
      ...documentResultTableLoadQuery,
      mutations,
      callback: (output: any) => {
        if (output.addedNodes) {
          PerfMetrics.trackPerfEnd('SEARCH_TABLE_EXPAND_ROW');
        }
        if (output.removedNodes) {
          PerfMetrics.trackPerfEnd('SEARCH_TABLE_EXPAND_ROW');
        }
      },
    });
  }
};

const onHandleRowClick = () => {
  PerfMetrics.trackPerfStart('SEARCH_TABLE_EXPAND_ROW');
};

export const DocumentResultTableWithPerformanceTracking: React.FC = () => {
  return (
    <PerformanceMetricsObserver
      onChange={handlePerformanceObserved}
      onRender={performanceOnRender}
    >
      <DocumentResultTable onHandleRowClick={onHandleRowClick} />
    </PerformanceMetricsObserver>
  );
};
