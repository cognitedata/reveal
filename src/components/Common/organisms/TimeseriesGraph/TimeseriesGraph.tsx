import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { Timeseries } from 'cognite-sdk-v3';
import { TimeseriesChart } from '@cognite/gearbox';
import { Select, Loader } from 'components/Common';

const TIME_PERIOD_OPTIONS = [
  { value: 'last10Year', label: '10 years' },
  { value: 'last5Year', label: '5 years' },
  { value: 'last2Year', label: '2 years' },
  { value: 'lastYear', label: '1 year' },
  { value: 'lastMonth', label: '1 month' },
  { value: 'lastWeek', label: '1 week' },
  { value: 'lastDay', label: '1 day' },
  { value: 'lastHour', label: '1 hour' },
  { value: 'last15Minutes', label: '15 minutes' },
];

interface TimeseriesGraphProps {
  timeseries?: Timeseries;
  graphHeight?: number;
  contextChart?: boolean;
}

const ChartToolbar = styled.div`
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  align-items: center;
  min-height: 50px;
  width: 100%;
  top: 0px;
  z-index: 190;
  border-top: 1px solid #d4d4d4;
  border-bottom: 1px solid #d4d4d4;
`;

export const TimeseriesGraph = ({
  timeseries,
  graphHeight,
  contextChart = false,
}: TimeseriesGraphProps) => {
  const wrapper = useRef<HTMLDivElement>(null);
  const [timePeriod, setTimePeriod] = useState<string>('last2Year');
  const [startTime, setStartTime] = useState<number | Date | undefined>(
    moment().subtract(2, 'year').toDate()
  );

  useEffect(() => {
    let selectedStartTime;
    switch (timePeriod) {
      case 'lastMonth':
        selectedStartTime = moment().subtract(1, 'month');
        break;
      case 'lastWeek':
        selectedStartTime = moment().subtract(1, 'week');
        break;
      case 'lastDay':
        selectedStartTime = moment().subtract(1, 'day');
        break;
      case 'lastHour':
        selectedStartTime = moment().subtract(1, 'hour');
        break;
      case 'last15Minutes':
        selectedStartTime = moment().subtract(15, 'minutes');
        break;
      case 'last2Year':
        selectedStartTime = moment().subtract(2, 'year');
        break;
      case 'last5Year':
        selectedStartTime = moment().subtract(5, 'year');
        break;
      case 'last10Year':
        selectedStartTime = moment().subtract(10, 'year');
        break;
      default:
        selectedStartTime = moment().subtract(1, 'year');
        break;
    }

    setStartTime(selectedStartTime.toDate());
  }, [timePeriod]);

  return (
    <div ref={wrapper}>
      <ChartToolbar>
        <span>Time period: </span>
        <Select
          styles={{
            container: style => ({
              ...style,
              display: 'inline-flex',
              flex: 1,
            }),
            control: () => ({
              width: '100%',
              display: 'flex',
            }),
          }}
          isClearable={false}
          value={TIME_PERIOD_OPTIONS.find(el => el.value === timePeriod)}
          onChange={item => setTimePeriod((item as { value: string }).value)}
          options={TIME_PERIOD_OPTIONS}
        />
      </ChartToolbar>

      <div style={{ marginTop: '12px', width: '100%' }}>
        {timeseries ? (
          <TimeseriesChart
            styles={{
              container: {
                height: graphHeight || 200,
              },
            }}
            height={graphHeight || 200}
            width={
              wrapper && wrapper.current
                ? wrapper.current.clientWidth
                : undefined
            }
            timeseriesIds={[timeseries.id]}
            crosshair
            contextChart={contextChart}
            startTime={startTime}
            endTime={new Date()}
            zoomable
          />
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
};
