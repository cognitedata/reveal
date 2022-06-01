import groupBy from 'lodash/groupBy';
import head from 'lodash/head';

import { Sequence } from 'modules/wellSearch/types';

export const getWellboreNameForTrajectory = (
  trajId = '',
  selectedTrajectories: Sequence[] = []
) => {
  const groupedTrajs = groupBy(selectedTrajectories, 'externalId');
  const trajectory = head(groupedTrajs[trajId]);
  return trajectory?.metadata?.wellboreName;
};
