import styled from 'styled-components';

import { Widget } from '@fdx/components';

import { TimeseriesChart } from '@cognite/plotting-components';

import { TimeseriesWidgetProps } from './TimeseriesWidget';

export const TimeseriesExpanded: React.FC<TimeseriesWidgetProps> = ({
  id,
  timeseriesId,
  dateRange,
  onChangeDateRange,
  rows,
  columns,
}) => {
  return (
    <Widget id={id} rows={rows} columns={columns} fullWidth expanded>
      <Widget.Body fullWidth>
        <Content>
          <TimeseriesChart
            // Come back and fix this
            timeseries={{ id: timeseriesId || 0 }}
            hideActions
            styles={timeseriesStyles}
            // Here this component is controlled by giving the 'dateRange' state as prop
            dateRange={dateRange}
            onChangeDateRange={onChangeDateRange}
          />
        </Content>
      </Widget.Body>
    </Widget>
  );
};

const timeseriesStyles = {
  backgroundColor: 'transparent',
  padding: 0,
};

const Content = styled.div`
  height: 100%;
  padding: 16px;
  border-radius: 10px;
`;
