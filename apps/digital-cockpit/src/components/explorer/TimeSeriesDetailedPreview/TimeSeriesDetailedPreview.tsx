import { Colors } from '@cognite/cogs.js';
import { DoubleDatapoint, Timeseries } from '@cognite/sdk';
import Loading from 'components/utils/Loading';
import useElementSize from 'hooks/useElementSize';
import useDatapointsQuery from 'hooks/useQuery/useDatapointsQuery';
import moment from 'moment';
import { useMemo } from 'react';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryVoronoiContainer,
  VictoryTooltip,
} from 'victory';

export type TimeSeriesDetailedPreviewProps = {
  timeSeries: Timeseries;
};

const TimeSeriesDetailedPreview = ({
  timeSeries,
}: TimeSeriesDetailedPreviewProps) => {
  const [containerRef, { width, height }] = useElementSize();
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
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <VictoryChart
        scale={{ x: 'time' }}
        width={width}
        height={height}
        containerComponent={
          <VictoryVoronoiContainer
            voronoiDimension="x"
            voronoiPadding={0}
            labels={({ datum }) =>
              `${datum.y.toFixed(3)}\n${moment(datum.x).format(
                'YYYY-MM-DD HH:mm:ss'
              )}`
            }
            labelComponent={
              <VictoryTooltip
                cornerRadius={0}
                pointerLength={0}
                constrainToVisibleArea
              />
            }
          />
        }
      >
        <VictoryLine
          style={{
            data: { stroke: '#4A67FB', strokeWidth: 1 },
          }}
          standalone={false}
          data={data}
        />
        <VictoryAxis
          crossAxis
          style={{
            ticks: { stroke: Colors['greyscale-grey7'].hex() },
            tickLabels: {
              fill: Colors['greyscale-grey7'].hex(),
            },
          }}
          tickCount={8}
        />
        <VictoryAxis
          crossAxis
          dependentAxis
          style={{
            ticks: { stroke: Colors['greyscale-grey7'].hex() },
            tickLabels: {
              fill: Colors['greyscale-grey7'].hex(),
            },
          }}
          tickCount={10}
        />
      </VictoryChart>
    </div>
  );
};

export default TimeSeriesDetailedPreview;
