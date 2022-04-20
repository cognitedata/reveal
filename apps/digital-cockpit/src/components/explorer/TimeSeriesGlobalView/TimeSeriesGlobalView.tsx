import { DateRange } from '@cognite/cogs.js';
import { Timeseries } from '@cognite/sdk';
import dayjs from 'dayjs';
import { useState } from 'react';

import TimeSeriesDetailedPreview from '../TimeSeriesDetailedPreview';
import TimeSeriesSidebar from '../TimeSeriesSidebar';

import { Container, Preview, Sidebar } from './elements';

export type TimeSeriesGlobalViewProps = {
  timeSeries: Timeseries;
};

const TimeSeriesGlobalView = ({ timeSeries }: TimeSeriesGlobalViewProps) => {
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [startDate, setStartDate] = useState<Date | undefined>(
    dayjs(endDate).subtract(1, 'month').toDate()
  );

  return (
    <Container>
      <Preview>
        <div>
          <DateRange
            range={{ startDate, endDate }}
            onChange={({ startDate, endDate }) => {
              setStartDate(dayjs(startDate).hour(0).minute(0).toDate());
              setEndDate(dayjs(endDate).hour(23).minute(59).toDate());
            }}
          />
        </div>
        <TimeSeriesDetailedPreview
          timeSeries={timeSeries}
          start={startDate}
          end={endDate}
        />
      </Preview>
      <Sidebar>
        <TimeSeriesSidebar
          timeSeries={timeSeries}
          showPreview={false}
          showHeader={false}
        />
      </Sidebar>
    </Container>
  );
};

export default TimeSeriesGlobalView;
