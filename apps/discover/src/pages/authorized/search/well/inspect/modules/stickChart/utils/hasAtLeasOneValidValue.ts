import isEmpty from 'lodash/isEmpty';
import { PlotData } from 'plotly.js';
import { withoutNil } from 'utils/withoutNil';

export const hasAtLeasOneValidValue = (data: Partial<PlotData>[]) => {
  return data.some(({ x }) => {
    if (!x) {
      return false;
    }

    const validValues = withoutNil(x as (number | null)[]);
    return !isEmpty(validValues);
  });
};
