import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { DoubleDatapoint, Timeseries } from '@cognite/sdk';
import StatusMessage from 'components/StatusMessage';
import dayjs from 'dayjs';
import useDatapointsQuery from 'hooks/useQuery/useDatapointsQuery';
import { useEffect, useMemo, useState } from 'react';
import { VictoryLine } from 'victory';

import { TimeSeriesPreviewWrapper } from './elements';

export type TimeSeriesPreviewProps = {
  timeSeries: Timeseries;
  color?: string;
  minimal?: boolean;
};

type Range = {
  display: string;
  value: string;
  start: number;
};

const ranges: Range[] = [
  {
    display: 'Last day',
    value: '1d-ago',
    start: dayjs().subtract(1, 'day').unix(),
  },
  {
    display: 'Last month',
    value: '31d-ago',
    start: dayjs().subtract(1, 'month').unix(),
  },
  {
    display: 'Last year',
    value: '365d-ago',
    start: dayjs().subtract(1, 'year').unix(),
  },
];

const TimeSeriesPreview = ({
  timeSeries,
  color = '#4A67FB',
  minimal,
}: TimeSeriesPreviewProps) => {
  const [range, setRange] = useState(ranges[2]);
  const {
    data: datapoints,
    isLoading,
    error,
  } = useDatapointsQuery([{ id: timeSeries.id, start: range.value }]);

  const { data: latestDatapoint } = useDatapointsQuery(
    [{ id: timeSeries.id }],
    { latestOnly: true }
  );

  const data = useMemo(
    () =>
      (datapoints?.[0]?.datapoints || []).map((dp) => ({
        x: dp.timestamp,
        y: (dp as DoubleDatapoint).value,
      })),
    [datapoints]
  );

  const minMax = useMemo(() => {
    const values: Record<string, number | undefined> = {
      min: undefined,
      max: undefined,
    };
    const dps = datapoints?.[0]?.datapoints;
    if (!dps) {
      return values;
    }
    for (let i = 0; i < dps.length; i++) {
      const { value } = dps[i] as DoubleDatapoint;
      if (
        value >
        (values.max === undefined ? Number.MIN_SAFE_INTEGER : values.max)
      )
        values.max = value;
      if (
        value <
        (values.min === undefined ? Number.MAX_SAFE_INTEGER : values.min)
      )
        values.min = value;
    }
    return values;
  }, [datapoints]);

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

  const renderRangeSelector = () => {
    return (
      <Dropdown
        content={
          <Menu>
            {ranges.map((range) => (
              <Menu.Item key={range.value} onClick={() => setRange(range)}>
                {range.display}
              </Menu.Item>
            ))}
          </Menu>
        }
      >
        <Button type="ghost" iconPlacement="right" icon="ChevronDown">
          {range.display}
        </Button>
      </Dropdown>
    );
  };

  if (isLoading) {
    return <StatusMessage type="Loading" />;
  }

  if (error) {
    return (
      <StatusMessage type="Error" message="We could not load this preview" />
    );
  }

  const renderChart = () => {
    if (!data || data.length <= 0) {
      return (
        <StatusMessage
          type="Missing.Datapoints"
          message="No data points found in this time range"
        />
      );
    }
    return (
      <div className="chart-container">
        <svg
          viewBox={`0 0 ${width} 350`}
          preserveAspectRatio="none"
          width="100%"
        >
          <VictoryLine
            style={{
              data: { stroke: color, strokeWidth: 6 },
            }}
            standalone={false}
            data={data}
            width={width}
            height={350}
            maxDomain={{ x: Date.now() }}
          />
        </svg>
        {!minimal && (
          <>
            <div className="max">{minMax.max}</div>
            <div className="min">{minMax.min}</div>
          </>
        )}
      </div>
    );
  };
  if (minimal) {
    return renderChart();
  }

  const renderLatestDatapoint = () => {
    if (!latestDatapoint) {
      return null;
    }
    return (latestDatapoint[0].datapoints[0] as DoubleDatapoint)?.value;
  };

  return (
    <TimeSeriesPreviewWrapper>
      <header>
        <span className="display-value" style={{ color }}>
          {renderLatestDatapoint()}
        </span>
        <br />
        <span className="unit">
          {timeSeries.unit} @{' '}
          {dayjs(latestDatapoint?.[0].datapoints[0].timestamp).format('LLL')}
        </span>
      </header>
      {renderChart()}
      {renderRangeSelector()}
    </TimeSeriesPreviewWrapper>
  );
};

export default TimeSeriesPreview;
