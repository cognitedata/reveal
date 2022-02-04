import { useEffect, useMemo, useState } from 'react';
import { DoubleDatapoint, Timeseries } from '@cognite/sdk';
import { VictoryAxis, VictoryChart, VictoryLine } from 'victory';
import Loading from 'components/utils/Loading';
import useDatapointsQuery from 'hooks/useQuery/useDatapointsQuery';
import { Colors } from '@cognite/cogs.js';

export type TimeSeriesPreviewProps = {
  timeSeries: Timeseries;
  showYAxis?: boolean;
};

const TimeSeriesPreview = ({
  timeSeries,
  showYAxis = false,
}: TimeSeriesPreviewProps) => {
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

  const lineChart = (
    <VictoryLine
      style={{
        data: { stroke: '#4A67FB', strokeWidth: 6 },
      }}
      standalone={false}
      data={data}
      width={width}
      height={350}
    />
  );

  const renderSimplePreview = () => {
    return (
      <svg viewBox={`0 0 ${width} 350`} preserveAspectRatio="none" width="100%">
        {lineChart}
      </svg>
    );
  };

  const renderPreviewWithYAxis = () => {
    return (
      <VictoryChart padding={{ top: 30, bottom: 30, left: 20, right: 45 }}>
        {lineChart}
        <VictoryAxis
          dependentAxis
          offsetX={40}
          orientation="right"
          style={{
            axis: { stroke: 'none' },
            ticks: { stroke: Colors['greyscale-grey7'].hex(), size: 5 },
            tickLabels: {
              fill: Colors['greyscale-grey7'].hex(),
              fontSize: 20,
              padding: 5,
            },
          }}
        />
      </VictoryChart>
    );
  };

  return showYAxis ? renderPreviewWithYAxis() : renderSimplePreview();
};

export default TimeSeriesPreview;
