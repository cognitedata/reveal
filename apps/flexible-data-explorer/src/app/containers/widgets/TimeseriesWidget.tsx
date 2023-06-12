import styled from 'styled-components';

import { TimeseriesChart } from '@cognite/plotting-components';

import { BaseWidgetProps, Widget } from '../../components/widget/Widget';

export interface TimeseriesProps extends BaseWidgetProps {
  timeseriesId?: number;
}

export const TimeseriesWidget: React.FC<TimeseriesProps> = ({
  id,
  timeseriesId,
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
