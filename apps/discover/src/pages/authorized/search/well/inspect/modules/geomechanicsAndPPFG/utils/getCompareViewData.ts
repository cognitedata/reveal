import flatten from 'lodash/flatten';
import { toBooleanMap } from 'utils/booleanMap';

import { WellWellboreSelection, MeasurementsView } from '../types';

export const getCompareViewData = (
  data: MeasurementsView[],
  compareViewSelection: WellWellboreSelection
) => {
  const wellboreSelection = toBooleanMap(
    flatten(Object.values(compareViewSelection))
  );

  return data.filter(
    ({ wellboreMatchingId }) => wellboreSelection[wellboreMatchingId]
  );
};
