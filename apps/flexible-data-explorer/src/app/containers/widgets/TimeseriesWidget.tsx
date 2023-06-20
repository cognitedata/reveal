import styled from 'styled-components';

import { TimeseriesChart } from '@cognite/plotting-components';

import { BaseWidgetProps, Widget } from '../../components/widget/Widget';
import { DateRange } from '../../containers/search/Filter';

export interface TimeseriesProps extends BaseWidgetProps {
  timeseriesId?: number;
  dateRange?: DateRange;
  onChangeDateRange?: (dateRange: DateRange) => void;
}

export const TimeseriesWidget: React.FC<TimeseriesProps> = ({
  id,
  timeseriesId,
  dateRange,
  onChangeDateRange,
  rows,
  columns,
}) => {
  return (
    <Widget id={id} rows={rows} columns={columns}>
      <Widget.Header title="Chart preview"></Widget.Header>

      <Widget.Body>
        <Content>
          <TimeseriesChart
            // Come back and fix this
            timeseriesId={timeseriesId || 0}
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
  padding-bottom: 8px;
`;
