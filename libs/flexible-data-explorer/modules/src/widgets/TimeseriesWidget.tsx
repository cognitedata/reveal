import styled from 'styled-components';

import { BaseWidgetProps, Widget } from '@fdx/components';
import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import { DateRange } from '@fdx/shared/types/filters';

import { TimeseriesChart } from '@cognite/plotting-components';

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
  const { t } = useTranslation();

  return (
    <Widget id={id} rows={rows} columns={columns}>
      <Widget.Header title={t('TIMESERIES_WIDGET_NAME')}></Widget.Header>

      <Widget.Body>
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
  padding-bottom: 8px;
`;
