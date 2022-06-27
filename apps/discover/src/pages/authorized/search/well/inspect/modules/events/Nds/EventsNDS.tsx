import React, { useState } from 'react';

import isEmpty from 'lodash/isEmpty';

import { PerfMetrics } from '@cognite/metrics';

import EmptyState from 'components/EmptyState';
import { Loading } from 'components/Loading';
import {
  PerformanceMetricsObserver,
  PerformanceObserved,
} from 'components/Performance';
import { Table } from 'components/Tablev3';
import {
  LOG_EVENTS_NDS,
  LOG_WELLS_EVENTS_NDS_NAMESPACE,
} from 'constants/logging';
import {
  useCreateMetricAndStartTimeLogger,
  useStopTimeLogger,
  TimeLogStages,
} from 'hooks/useTimeLog';
import { useNdsEventsForTable } from 'modules/wellSearch/selectors';
import { CogniteEventV3ish } from 'modules/wellSearch/types';

import { NdsFilterWrapper } from '../elements';

import { getDataLayer } from './dataLayer';
import FilterContainer from './FilterContainer';

const tableOptions = {
  flex: false,
  hideBorders: false,
  height: '100%',
  pagination: {
    enabled: true,
    pageSize: 50,
  },
};

export const EventsNds: React.FC = () => {
  const renderTimer = useCreateMetricAndStartTimeLogger(
    TimeLogStages.Render,
    LOG_EVENTS_NDS,
    LOG_WELLS_EVENTS_NDS_NAMESPACE
  );

  /**
   * This is old stuff and will be removed. So don't worry about this.
   */
  const columns: unknown[] = [];

  const { events, isLoading } = useNdsEventsForTable();
  const ndsEvents = getDataLayer(events);

  const [filteredEvents, setFilteredEvents] = useState<CogniteEventV3ish[]>([]);

  useStopTimeLogger(renderTimer);
  if (isLoading) return <Loading />;

  const handlePerformanceObserved = ({
    mutations,
    data,
  }: PerformanceObserved) => {
    if (mutations) {
      PerfMetrics.trackPerfEnd('NDS_PAGE_LOAD');
    }
    if (data && data.length === 0) {
      PerfMetrics.trackPerfEnd('NDS_PAGE_LOAD');
    }
  };

  return (
    <>
      <PerformanceMetricsObserver
        onChange={handlePerformanceObserved}
        data={filteredEvents}
      >
        <NdsFilterWrapper>
          <FilterContainer
            events={ndsEvents}
            filteredEvents={filteredEvents}
            onChangeFilteredEvents={setFilteredEvents}
          />
        </NdsFilterWrapper>

        {isEmpty(filteredEvents) ? (
          <EmptyState />
        ) : (
          <Table<CogniteEventV3ish>
            scrollTable
            id="events-nds-table"
            data={filteredEvents || []}
            columns={columns}
            options={tableOptions}
          />
        )}
      </PerformanceMetricsObserver>
    </>
  );
};

export default EventsNds;
