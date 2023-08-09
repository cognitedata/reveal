import { BaseWidgetProps } from '../../../components/widget/Widget';
import { DateRange } from '../../Filter';

import { TimeseriesCollapsed } from './TimeseriesCollapsed';
import { TimeseriesExpanded } from './TimeseriesExpanded';

export interface TimeseriesWidgetProps extends BaseWidgetProps {
  timeseriesId?: number;
  dateRange?: DateRange;
  onChangeDateRange?: (dateRange: DateRange) => void;
}

// NOTE: Generalize the toggle between expanded and collapse, somehow.
export const TimeseriesWidget: React.FC<TimeseriesWidgetProps> = (props) => {
  if (props.isExpanded) {
    return <TimeseriesExpanded {...props} />;
  }
  return <TimeseriesCollapsed {...props} />;
};
