import { Icon, Tooltip } from '@cognite/cogs.js';
import { DoubleDatapoint, Timeseries } from '@cognite/sdk';
// import Loading from 'components/utils/Loading';
import useDatapointsQuery from 'hooks/useQuery/useDatapointsQuery';

import TimeSeriesPreview from '../TimeSeriesPreview';

import { RowWrapper } from './elements';

export type TimeSeriesRowProps = {
  timeSeries: Timeseries;
  // descriptionField?: string;
  onClick?: () => void;
};

const TimeSeriesRow = ({ timeSeries, onClick }: TimeSeriesRowProps) => {
  const {
    data: latestDatapoint,
    isLoading: isLoadingLatestDatapoint,
    error,
  } = useDatapointsQuery([{ id: timeSeries.id }], { latestOnly: true });

  const renderLatest = () => {
    if (isLoadingLatestDatapoint) {
      return <Icon type="Loader" />;
    }
    if (error) {
      return (
        <Tooltip content={<>{JSON.stringify(error || 'Failed to load')}</>}>
          <Icon type="Warning" />
        </Tooltip>
      );
    }

    const value = (latestDatapoint?.[0].datapoints[0] as DoubleDatapoint)
      ?.value;

    if (value === undefined) {
      return (
        <span style={{ opacity: 0.7, fontStyle: 'italic' }}>No value</span>
      );
    }
    return (
      <>
        {value} {timeSeries.unit || ''}
      </>
    );
  };

  return (
    <RowWrapper onClick={onClick} className="row">
      <section className="row--image">
        <TimeSeriesPreview timeSeries={timeSeries} />
      </section>
      <section className="row--meta">
        <h4>{timeSeries.name}</h4>
        <div>
          {renderLatest()}
          {timeSeries.description && ` • ${timeSeries.description}`}
        </div>
      </section>
    </RowWrapper>
  );
};

export default TimeSeriesRow;
