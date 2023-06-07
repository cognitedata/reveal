import { Variant } from '../../LineChart';
import { TimeseriesChartLarge } from '../components/TimeseriesChartLarge';
import { TimeseriesChartSmall } from '../components/TimeseriesChartSmall';

export const getChartByVariant = (variant: Variant) => {
  switch (variant) {
    case 'small':
      return TimeseriesChartSmall;

    case 'large':
      return TimeseriesChartLarge;

    default:
      return TimeseriesChartLarge;
  }
};
