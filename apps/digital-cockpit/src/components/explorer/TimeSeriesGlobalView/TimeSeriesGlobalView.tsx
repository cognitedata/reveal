import { Timeseries } from '@cognite/sdk';

import TimeSeriesDetailedPreview from '../TimeSeriesDetailedPreview';
import TimeSeriesSidebar from '../TimeSeriesSidebar';

import { Container, Preview, Sidebar } from './elements';

export type TimeSeriesGlobalViewProps = {
  timeSeries: Timeseries;
};

const TimeSeriesGlobalView = ({ timeSeries }: TimeSeriesGlobalViewProps) => {
  return (
    <Container>
      <Preview>
        <TimeSeriesDetailedPreview timeSeries={timeSeries} />
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
