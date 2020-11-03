import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { LineChart, LineChartProps, ButtonGroup, Loader } from 'lib/components';
import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import AutoSizer from 'react-virtualized-auto-sizer';

export type TIME_OPTION_KEY =
  | '10Y'
  | '5Y'
  | '2Y'
  | '1Y'
  | '1M'
  | '1W'
  | '1D'
  | '12H'
  | '6H'
  | '1H'
  | '15M';

const TIME_SELECT: {
  [key in TIME_OPTION_KEY]: {
    label: string;
    getStartTime: () => moment.Moment;
  };
} = {
  '10Y': { label: '10Y', getStartTime: () => moment().subtract(10, 'years') },
  '5Y': { label: '5Y', getStartTime: () => moment().subtract(5, 'years') },
  '2Y': { label: '2Y', getStartTime: () => moment().subtract(2, 'years') },
  '1Y': { label: '1Y', getStartTime: () => moment().subtract(1, 'years') },
  '1M': { label: '1M', getStartTime: () => moment().subtract(1, 'months') },
  '1W': { label: '1W', getStartTime: () => moment().subtract(7, 'days') },
  '1D': { label: '1D', getStartTime: () => moment().subtract(1, 'days') },
  '12H': { label: '12H', getStartTime: () => moment().subtract(12, 'hours') },
  '6H': { label: '6H', getStartTime: () => moment().subtract(6, 'hours') },
  '1H': { label: '1H', getStartTime: () => moment().subtract(1, 'hours') },
  '15M': { label: '15M', getStartTime: () => moment().subtract(15, 'minutes') },
};

export type TimeseriesChartProps = {
  timeseriesId: number;
  height?: number;
  numberOfPoints?: number;
  showContextGraph?: boolean;
  timeOptions?: TIME_OPTION_KEY[];
  defaultOption?: TIME_OPTION_KEY;
  cacheToDate?: boolean;
} & Omit<
  LineChartProps,
  'values' | 'focusedValues' | 'zoom' | 'scaleType' | 'onZoomChanged' | 'width'
>;

export const TimeseriesChart = ({
  timeseriesId,
  height,
  numberOfPoints = 1000,
  timeOptions = ['15M', '1H', '6H', '12H', '1D', '1M', '1Y', '2Y', '5Y', '10Y'],
  defaultOption,
  cacheToDate = true,
  ...otherProps
}: TimeseriesChartProps) => {
  const sdk = useSDK();
  const [timePeriod, setTimePeriod] = useState<TIME_OPTION_KEY>(
    defaultOption || timeOptions[0]
  );

  const [presetZoom, setPresetZoomDomain] = useState<[Date, Date]>([
    TIME_SELECT[timePeriod]
      .getStartTime()
      .startOf(cacheToDate ? 'day' : 'ms')
      .toDate(),
    moment()
      .startOf(cacheToDate ? 'day' : 'ms')
      .toDate(),
  ]);

  useEffect(() => {
    setPresetZoomDomain([
      TIME_SELECT[timePeriod]
        .getStartTime()
        .startOf(cacheToDate ? 'day' : 'ms')
        .toDate(),
      moment()
        .startOf(cacheToDate ? 'day' : 'ms')
        .toDate(),
    ]);
  }, [timePeriod, cacheToDate]);
  const { data: overallData, isLoading } = useQuery(
    [
      'timeseries',
      timeseriesId,
      'values',
      presetZoom[0].toString(),
      presetZoom[1].toString(),
    ],
    async () => {
      return (
        await sdk.datapoints.retrieve({
          items: [{ id: timeseriesId }],
          end: presetZoom[1].valueOf(),
          start: presetZoom[0].valueOf(),
          granularity: calculateGranularity(
            presetZoom.map(el => el.valueOf()),
            numberOfPoints
          ),
          limit: numberOfPoints,
          aggregates: ['count', 'min', 'max', 'average'],
        })
      )[0];
    },
    {
      staleTime: Infinity,
    }
  );
  return (
    <>
      <div style={{ ...(height ? { height } : { flex: 1 }), width: '100%' }}>
        <AutoSizer disableHeight={!!height}>
          {({ width, height: innerHeight }) => {
            if (isLoading) {
              return (
                <div style={{ height: height || innerHeight, width }}>
                  <Loader />
                </div>
              );
            }
            return (
              <LineChart
                width={width}
                height={height || innerHeight}
                values={((overallData?.datapoints ?? []) as any[]).filter(
                  el => !!el.average && !!el.min && !!el.max
                )}
                domain={presetZoom}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
              />
            );
          }}
        </AutoSizer>
      </div>
      {timeOptions.length > 1 && (
        <div>
          <ButtonGroup
            variant="ghost"
            currentKey={timePeriod}
            onButtonClicked={key => setTimePeriod(key as TIME_OPTION_KEY)}
          >
            {timeOptions.map(key => (
              <ButtonGroup.Button key={key}>
                {TIME_SELECT[key].label}
              </ButtonGroup.Button>
            ))}
          </ButtonGroup>
        </div>
      )}
    </>
  );
};

/**
 * Calculates the `granularity` for a timeseries request
 *
 * @param domain Domain [utc int, utc int]
 * @param pps points to show
 */
const calculateGranularity = (domain: number[], pps: number) => {
  const diff = domain[1] - domain[0];
  for (let i = 1; i <= 60; i += 1) {
    const points = diff / (1000 * i);
    if (points < pps) {
      return `${i === 1 ? '' : i}s`;
    }
  }
  for (let i = 1; i <= 60; i += 1) {
    const points = diff / (1000 * 60 * i);
    if (points < pps) {
      return `${i === 1 ? '' : i}m`;
    }
  }
  for (let i = 1; i < 24; i += 1) {
    const points = diff / (1000 * 60 * 60 * i);
    if (points < pps) {
      return `${i === 1 ? '' : i}h`;
    }
  }
  for (let i = 1; i < 100; i += 1) {
    const points = diff / (1000 * 60 * 60 * 24 * i);
    if (points < pps) {
      return `${i === 1 ? '' : i}day`;
    }
  }
  return 'day';
};
