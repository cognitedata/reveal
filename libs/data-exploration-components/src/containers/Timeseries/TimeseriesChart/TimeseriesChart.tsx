import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';

import { Loader } from '@data-exploration/components';
import { useQuery } from '@tanstack/react-query';
import { ParentSize } from '@visx/responsive';

import { Button, OptionType, Select } from '@cognite/cogs.js';
import { DatapointAggregates, Datapoints } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { baseCacheKey } from '@cognite/sdk-react-query-hooks';

import {
  DATA_EXPLORATION_COMPONENT,
  DateRangeProps,
  ResourceTypes,
  TIME_SELECT,
  useMetrics,
} from '@data-exploration-lib/core';

import {
  LineChart,
  LineChartProps,
  RangePicker,
  SpacedRow,
} from '../../../components';
import { TimeOptions } from '../types';
import { calculateGranularity } from '../utils/calculateGranularity';

export type TimeseriesChartProps = {
  timeseriesId: number;
  height?: number;
  numberOfPoints?: number;
  showContextGraph?: boolean;
  timeOptions?: TimeOptions[];
  defaultOption?: TimeOptions;
  cacheToDate?: boolean;
  showCustomRangePicker?: boolean;
  enableTooltipPreview?: boolean;
  disableStep?: boolean;
  disabled?: boolean;
  timeOptionShortcut?: TimeOptions[];
  onDataFetched?: (data?: DatapointAggregates | Datapoints) => void;
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
  numberOfPoints = 20,
  timeOptions = Object.values(TimeOptions),
  defaultOption,
  cacheToDate = true,
  showCustomRangePicker = false,
  dateRange,
  onDateRangeChange,
  disabled = false,
  disableStep = false,
  onDataFetched,
  timeOptionShortcut,
  ...otherProps
}: TimeseriesChartProps) => {
  const sdk = useSDK();
  const [timePeriod, setTimePeriod] = useState<TimeOptions | undefined>(
    defaultOption || (dateRange ? undefined : timeOptions[0])
  );
  const trackUsage = useMetrics();
  const resourceType = ResourceTypes.TimeSeries;

  const [presetZoom, setPresetZoomDomain] = useState<[Date, Date]>(
    dateRange || TIME_SELECT[timePeriod || timeOptions[0]].getTime()
  );

  const timeSelectOptions = useMemo(() => {
    return timeOptions.map((key) => ({ label: key, value: key }));
  }, [timeOptions]);

  useEffect(() => {
    if (dateRange) {
      setPresetZoomDomain(dateRange);
      setTimePeriod(undefined);
    }
  }, [dateRange]);

  useEffect(() => {
    if (!timePeriod && onDateRangeChange) {
      onDateRangeChange(presetZoom);
    }
  }, [onDateRangeChange, presetZoom, timePeriod]);

  useEffect(() => {
    if (timePeriod) {
      setPresetZoomDomain(TIME_SELECT[timePeriod].getTime());
    }
  }, [timePeriod, cacheToDate]);

  const handleSelectOnChange = ({ value }: OptionType<TimeOptions>) => {
    if (value) {
      setTimePeriod(value);
    }
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.TIME_PERIOD, {
      resourceType,
      value,
    });
  };

  const {
    data: overallData,
    isFetched,
    isFetching,
  } = useQuery(
    [
      ...baseCacheKey('timeseries'),
      'datapoints',
      timeseriesId,
      {
        start: presetZoom[0].getTime(),
        end: presetZoom[1].getTime(),
      },
      calculateGranularity(
        presetZoom.map((el) => el.valueOf()),
        numberOfPoints
      ),
      numberOfPoints,
      ['count', 'min', 'max', 'average'],
    ],
    async () =>
      (
        await sdk.datapoints.retrieve({
          items: [{ id: timeseriesId }],
          end: presetZoom[1].valueOf(),
          start: presetZoom[0].valueOf(),
          granularity: calculateGranularity(
            presetZoom.map((el) => el.valueOf()),
            numberOfPoints
          ),
          limit: numberOfPoints,
          aggregates: ['count', 'min', 'max', 'average'],
        })
      )[0],
    {
      staleTime: Infinity,
      enabled: !disabled,
      onSuccess: (data) => onDataFetched?.(data),
      onError: () => onDataFetched?.(undefined),
    }
  );

  return (
    <>
      <ParentSize>
        {(parent) =>
          isFetching && !isFetched ? (
            <div
              style={{
                height: height || parent.height,
                width: parent.width,
              }}
            >
              <Loader />
            </div>
          ) : (
            <LineChart
              width={parent.width}
              height={height || parent.height - 30}
              values={((overallData?.datapoints ?? []) as any[]).filter(
                (el) => el.average !== undefined
              )}
              domain={presetZoom}
              {...otherProps}
            />
          )
        }
      </ParentSize>

      <SpacedRow>
        {!disableStep && timeOptions.length > 0 && (
          <StyledRangePickerWrapper>
            {(timeOptionShortcut || []).map((shortcut: TimeOptions) => (
              <Button
                key={shortcut}
                type="secondary"
                size="small"
                toggled={timePeriod === shortcut}
                onClick={() => setTimePeriod(shortcut)}
              >
                {shortcut}
              </Button>
            ))}
            <StyledSelect
              title="Other:"
              value={
                timePeriod && {
                  label: timePeriod,
                  value: timePeriod,
                }
              }
              options={timeSelectOptions}
              onChange={handleSelectOnChange}
              width={250}
            />
          </StyledRangePickerWrapper>
        )}
        {showCustomRangePicker && (
          <RangePicker
            buttonProps={{
              type: 'tertiary',
            }}
            initialRange={presetZoom}
            onRangeChanged={(range) => {
              setTimePeriod(undefined);
              setPresetZoomDomain(range);
              trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.TIME_RANGE, {
                resourceType,
                value: range,
              });
            }}
          />
        )}
      </SpacedRow>
    </>
  );
};

const StyledSelect = styled(Select)`
  .cogs-select__menu {
    height: 200px;
  }
`;

const StyledRangePickerWrapper = styled.div`
  display: flex;
  margin-top: auto;
  margin-bottom: auto;

  * {
    margin-right: 6px;
  }
`;
