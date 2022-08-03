import React, { useMemo, useRef, useState } from 'react';

import isEmpty from 'lodash/isEmpty';

import { PerfMetrics } from '@cognite/metrics';

import EmptyState from 'components/EmptyState';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';
import {
  PerformanceMetricsObserver,
  PerformanceObserved,
} from 'components/Performance';

import { WellboreCasingsViewsWrapper } from './elements';
import { FilterBar } from './filters/FilterBar';
import { useCasingsData } from './hooks/useCasingsData';
import { WellboreCasingView } from './WellboreCasingView';
import { COLUMNS, DEFAULT_COLUMN_ORDER } from './WellboreCasingView/constants';

const StickChart: React.FC = () => {
  const { data, isLoading, isNptEventsLoading, isNdsEventsLoading } =
    useCasingsData();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [columnOrder, setColumnOrder] =
    useState<string[]>(DEFAULT_COLUMN_ORDER);
  const [visibleColumns, setVisibleColumns] = useState<Array<string>>([
    COLUMNS.CASINGS,
    COLUMNS.NDS,
    COLUMNS.NPT,
    COLUMNS.SUMMARY,
  ]);

  const [selectedNptCodes, setSelectedNptCodes] =
    useState<MultiSelectCategorizedOptionMap>({});

  const [selectedNdsCodes, setSelectedNdsCodes] =
    useState<MultiSelectCategorizedOptionMap>({});

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

  const Filters = useMemo(() => {
    return (
      <FilterBar
        onNptCodesChange={setSelectedNptCodes}
        onNdsCodesChange={setSelectedNdsCodes}
        onRearrange={setColumnOrder}
        onVisibleColumnChange={setVisibleColumns}
      />
    );
  }, [setColumnOrder, setVisibleColumns]);

  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <PerformanceMetricsObserver
      onChange={handlePerformanceObserved}
      data={data}
    >
      {Filters}
      <WellboreCasingsViewsWrapper ref={scrollRef}>
        {data.map((casingsView) => (
          <WellboreCasingView
            key={`casings-view-${casingsView.wellboreName}`}
            data={casingsView}
            columnOrder={columnOrder}
            visibleColumns={visibleColumns}
            selectedNptCodes={selectedNptCodes}
            selectedNdsCodes={selectedNdsCodes}
            isNptEventsLoading={isNptEventsLoading}
            isNdsEventsLoading={isNdsEventsLoading}
          />
        ))}
      </WellboreCasingsViewsWrapper>
    </PerformanceMetricsObserver>
  );
};

export default StickChart;
