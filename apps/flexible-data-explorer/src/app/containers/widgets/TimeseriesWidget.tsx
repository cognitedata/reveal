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
        <TimeseriesChart
          timeseriesId={timeseriesId || 0}
          hideActions
          styles={{ backgroundColor: 'transparent', padding: 0 }}
        />
      </Widget.Body>
    </Widget>
  );
};
