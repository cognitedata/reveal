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

import {
  COMMON_COLUMN_ACCESSORS,
  COMMON_COLUMN_WIDTHS,
} from '../../../constants';
import { accessors, widths } from '../constants';
import { NdsFilterContent, NdsFilterWrapper, ResizeHandle } from '../elements';

import FilterContainer from './FilterContainer';

const columns = [
  {
    Header: 'Well',
    accessor: COMMON_COLUMN_ACCESSORS.WELL_NAME,
    width: COMMON_COLUMN_WIDTHS.WELL_NAME,
  },
  {
    Header: 'Wellbore',
    accessor: COMMON_COLUMN_ACCESSORS.WELLBORE_NAME,
    width: COMMON_COLUMN_WIDTHS.WELLBORE_NAME,
  },
  {
    Header: 'Risk Type',
    accessor: accessors.RISK_TYPE,
  },
  {
    Header: 'Severity',
    accessor: accessors.SEVERITY,
  },
  {
    Header: 'Probability',
    accessor: accessors.PROBABILITY,
  },
  {
    Header: 'Risk Subtype',
    accessor: accessors.RISK_SUB_CATEGORY,
    width: widths.RISK_SUB_CATEGORY,
  },
  {
    Header: 'Diameter Hole (in)',
    accessor: accessors.DIAMETER_HOLE,
  },
  {
    Header: 'MD Hole Start (ft)',
    accessor: accessors.MD_HOLE_START,
  },
  {
    Header: 'MD Hole End (ft)',
    accessor: accessors.MD_HOLE_END,
  },
  {
    Header: 'TVD Offset Hole Start (ft)',
    accessor: accessors.TVD_OFFSET_HOLE_START,
  },
  {
    Header: 'TVD Offset Hole End (ft)',
    accessor: accessors.TVD_OFFSET_HOLE_END,
  },
];

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
