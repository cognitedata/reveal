import { useEffect, useMemo, useState } from 'react';
import { DoubleDatapoint, Timeseries } from '@cognite/sdk';
import { VictoryAxis, VictoryChart, VictoryLine } from 'victory';
import Loading from 'components/utils/Loading';
import useDatapointsQuery from 'hooks/useQuery/useDatapointsQuery';
import { Colors } from '@cognite/cogs.js';
import useElementSize from 'hooks/useElementSize';

export type TimeSeriesPreviewProps = {
  timeSeries: Timeseries;
  showYAxis?: boolean;
  onClick?: () => void;
};

const TimeSeriesPreview = ({
  timeSeries,
  showYAxis = false,
  onClick,
}: TimeSeriesPreviewProps) => {
  const {
    data: datapoints,
    isLoading,
    error,
  } = useDatapointsQuery([{ id: timeSeries.id }]);
  const [containerRef, { width, height }] = useElementSize();
  const data = useMemo(
    () =>
      (datapoints?.[0]?.datapoints || []).map((dp) => ({
        x: dp.timestamp,
        y: (dp as DoubleDatapoint).value,
      })),
    [datapoints]
  );

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
        data: { stroke: '#4A67FB', strokeWidth: 1 },
      }}
      standalone={false}
      data={data}
      width={width}
      height={height}
    />
  );

  const renderSimplePreview = () => {
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        width="100%"
        height="100%"
      >
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

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', cursor: 'pointer' }}
      onClick={onClick}
      aria-hidden="true"
    >
      {showYAxis ? renderPreviewWithYAxis() : renderSimplePreview()}
    </div>
  );
};

export default TimeSeriesPreview;
