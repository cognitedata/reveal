import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { GetTimeSeriesMetadataDTO } from '@cognite/sdk';
import { TimeseriesChart } from '@cognite/gearbox';
import { Select } from 'antd';
import { SelectWrapper, Loader } from 'components/Common';

interface TimeseriesGraphProps {
  timeseries?: GetTimeSeriesMetadataDTO;
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
  padding-left: 16px;
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
        <span>
          Time period:{' '}
          <SelectWrapper style={{ display: 'inline-block' }}>
            <Select
              style={{
                width: '200px',
              }}
              value={timePeriod}
              onChange={(value: string) => setTimePeriod(value)}
            >
              <Select.Option value="last10Year">10 years</Select.Option>
              <Select.Option value="last5Year">5 years</Select.Option>
              <Select.Option value="last2Year">2 years</Select.Option>
              <Select.Option value="lastYear">1 year</Select.Option>
              <Select.Option value="lastMonth">1 month</Select.Option>
              <Select.Option value="lastWeek">1 week</Select.Option>
              <Select.Option value="lastDay">1 day</Select.Option>
              <Select.Option value="lastHour">1 hour</Select.Option>
              <Select.Option value="last15Minutes">15 minutes</Select.Option>
            </Select>
          </SelectWrapper>
        </span>
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
