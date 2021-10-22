import React, { useState } from 'react';
import { ResizableBox } from 'react-resizable';

import { CogniteEvent } from '@cognite/sdk';

import { WhiteLoader } from 'components/loading';
import { Table } from 'components/tablev2';
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

import { NdsFilterContent, NdsFilterWrapper, ResizeHandle } from '../elements';

import FilterContainer from './FilterContainer';
import { useGetNdsTableColumns } from './hooks/useHelpers';

const tableOptions = {
  flex: false,
  hideBorders: false,
  height: '100%',
  pagination: {
    enabled: true,
    pageSize: 50,
  },
};

const FILTER_PANEL_DEFAULT_HEIGHT = 200;
const FILTER_PANEL_MIN_SIZE: [number, number] = [50, 50];

export const EventsNds: React.FC = () => {
  const renderTimer = useCreateMetricAndStartTimeLogger(
    TimeLogStages.Render,
    LOG_EVENTS_NDS,
    LOG_WELLS_EVENTS_NDS_NAMESPACE
  );
  const [filteredEvents, setFilteredEvents] = useState<CogniteEvent[]>([]);
  const { events: ndsEvents, isLoading } = useNdsEventsForTable();
  const columns = useGetNdsTableColumns();

  useStopTimeLogger(renderTimer);
  if (isLoading) return <WhiteLoader />;

  return (
    <>
      <NdsFilterWrapper>
        <ResizableBox
          className="nds-events-expander"
          width={0}
          height={FILTER_PANEL_DEFAULT_HEIGHT}
          axis="y"
          minConstraints={FILTER_PANEL_MIN_SIZE}
          handle={<ResizeHandle />}
        >
          <NdsFilterContent>
            <FilterContainer
              events={ndsEvents}
              filteredEvents={filteredEvents}
              onChangeFilteredEvents={(events) => setFilteredEvents(events)}
            />
          </NdsFilterContent>
        </ResizableBox>
      </NdsFilterWrapper>
      <Table<CogniteEvent>
        scrollTable
        id="events-nds-table"
        data={filteredEvents || []}
        columns={columns}
        options={tableOptions}
      />
    </>
  );
};

export default EventsNds;
