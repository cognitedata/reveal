import React, { useEffect, useState } from 'react';
import {
  LineChart,
  LineChartProps,
  ButtonGroup,
  Loader,
  RangePicker,
  SpacedRow,
} from 'lib/components';
import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import AutoSizer from 'react-virtualized-auto-sizer';
import moment from 'moment';
import { DateRangeProps } from 'lib/CommonProps';

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

export const TIME_SELECT: {
  [key in TIME_OPTION_KEY]: {
    label: string;
    getTime: () => [Date, Date];
  };
} = {
  '10Y': {
    label: '10Y',
    getTime: () => [
      moment().subtract(10, 'years').startOf('seconds').toDate(),
      moment().startOf('seconds').toDate(),
    ],
  },
  '5Y': {
    label: '5Y',
    getTime: () => [
      moment().subtract(5, 'years').startOf('seconds').toDate(),
      moment().startOf('seconds').toDate(),
    ],
  },
  '2Y': {
    label: '2Y',
    getTime: () => [
      moment().subtract(2, 'years').startOf('seconds').toDate(),
      moment().startOf('seconds').toDate(),
    ],
  },
  '1Y': {
    label: '1Y',
    getTime: () => [
      moment().subtract(1, 'years').startOf('seconds').toDate(),
      moment().startOf('seconds').toDate(),
    ],
  },
  '1M': {
    label: '1M',
    getTime: () => [
      moment().subtract(1, 'months').startOf('seconds').toDate(),
      moment().startOf('seconds').toDate(),
    ],
  },
  '1W': {
    label: '1W',
    getTime: () => [
      moment().subtract(7, 'days').startOf('seconds').toDate(),
      moment().startOf('seconds').toDate(),
    ],
  },
  '1D': {
    label: '1D',
    getTime: () => [
      moment().subtract(1, 'days').startOf('seconds').toDate(),
      moment().startOf('seconds').toDate(),
    ],
  },
  '12H': {
    label: '12H',
    getTime: () => [
      moment().subtract(12, 'hours').startOf('seconds').toDate(),
      moment().startOf('seconds').toDate(),
    ],
  },
  '6H': {
    label: '6H',
    getTime: () => [
      moment().subtract(6, 'hours').startOf('seconds').toDate(),
      moment().startOf('seconds').toDate(),
    ],
  },
  '1H': {
    label: '1H',
    getTime: () => [
      moment().subtract(1, 'hours').startOf('seconds').toDate(),
      moment().startOf('seconds').toDate(),
    ],
  },
  '15M': {
    label: '15M',
    getTime: () => [
      moment().subtract(15, 'minutes').startOf('seconds').toDate(),
      moment().startOf('seconds').toDate(),
    ],
  },
};

export type TimeseriesChartProps = {
  timeseriesId: number;
  height?: number;
  numberOfPoints?: number;
  showContextGraph?: boolean;
  timeOptions?: TIME_OPTION_KEY[];
  defaultOption?: TIME_OPTION_KEY;
  cacheToDate?: boolean;
  showCustomRangePicker?: boolean;
} & Omit<
  LineChartProps,
  | 'values'
  | 'focusedValues'
  | 'zoom'
  | 'scaleType'
  | 'onZoomChanged'
  | 'width'
  | 'height'
> &
  DateRangeProps;

export const TimeseriesChart = ({
  timeseriesId,
  height,
  numberOfPoints = 1000,
  timeOptions = ['15M', '1H', '6H', '12H', '1D', '1M', '1Y', '2Y', '5Y', '10Y'],
  defaultOption,
  cacheToDate = true,
  showCustomRangePicker = false,
  dateRange,
  onDateRangeChange,
  ...otherProps
}: TimeseriesChartProps) => {
  const sdk = useSDK();
  const [timePeriod, setTimePeriod] = useState<TIME_OPTION_KEY | 'custom'>(
    defaultOption || (dateRange ? 'custom' : timeOptions[0])
  );

  const [presetZoom, setPresetZoomDomain] = useState<[Date, Date]>(
    dateRange ||
      TIME_SELECT[
        timePeriod !== 'custom' ? timePeriod : timeOptions[0]
      ].getTime()
  );

  useEffect(() => {
    if (dateRange) {
      setPresetZoomDomain(dateRange);
      setTimePeriod('custom');
    }
  }, [dateRange]);

  useEffect(() => {
    if (timePeriod === 'custom' && onDateRangeChange) {
      onDateRangeChange(presetZoom);
    }
  }, [onDateRangeChange, presetZoom, timePeriod]);

  useEffect(() => {
    if (timePeriod !== 'custom') {
      setPresetZoomDomain(TIME_SELECT[timePeriod].getTime());
    }
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
                {...otherProps}
              />
            );
          }}
        </AutoSizer>
      </div>

      <SpacedRow>
        {timeOptions.length > 1 && (
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
        )}
        {showCustomRangePicker && (
          <RangePicker
            buttonProps={{
              type: timePeriod === 'custom' ? 'primary' : 'secondary',
              variant: 'outline',
            }}
            initialRange={presetZoom}
            onRangeChanged={range => {
              setTimePeriod('custom');
              setPresetZoomDomain(range);
            }}
          />
        )}
      </SpacedRow>
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
