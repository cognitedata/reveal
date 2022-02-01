import { useEffect, useMemo, useState } from 'react';
import { DoubleDatapoint, Timeseries } from '@cognite/sdk';
import { VictoryLine } from 'victory';
import Loading from 'components/utils/Loading';
import useDatapointsQuery from 'hooks/useQuery/useDatapointsQuery';

export type TimeSeriesPreviewProps = {
  timeSeries: Timeseries;
};

const TimeSeriesPreview = ({ timeSeries }: TimeSeriesPreviewProps) => {
  const {
    data: datapoints,
    isLoading,
    error,
  } = useDatapointsQuery([{ id: timeSeries.id }]);

  const data = useMemo(
    () =>
      (datapoints?.[0]?.datapoints || []).map((dp) => ({
        x: dp.timestamp,
        y: (dp as DoubleDatapoint).value,
      })),
    [datapoints]
  );

  const [width, setWidth] = useState(window.innerWidth);
  const updateWidth = (e: any) => {
    setWidth(e.target.innerWidth);
  };

  useEffect(() => {
    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>Could not load preview</div>;
  }

  if (!data || data.length <= 0) {
    return <div>No data</div>;
  }

  return (
    <svg viewBox={`0 0 ${width} 350`} preserveAspectRatio="none" width="100%">
      <VictoryLine
        style={{
          data: { stroke: '#4A67FB', strokeWidth: 6 },
        }}
        standalone={false}
        data={data}
        width={width}
        height={350}
      />
    </svg>
  );
};

export default TimeSeriesPreview;
