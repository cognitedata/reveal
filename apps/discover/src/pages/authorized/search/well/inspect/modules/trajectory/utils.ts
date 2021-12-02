import groupBy from 'lodash/groupBy';
import head from 'lodash/head';

import { Sequence } from '@cognite/sdk';

import { SelectedMap } from 'modules/filterData/types';
import { Wellbore } from 'modules/wellSearch/types';

export const getWellboreNameForTrajectory = (
  trajId = '',
  selectedTrajectories: Sequence[] = []
) => {
  const groupedTrajs = groupBy(selectedTrajectories, 'externalId');
  const trajectory = head(groupedTrajs[trajId]);
  return trajectory?.metadata?.wellboreName;
};

export const mapSelectedWellbores = (
  selectedWellboreList: Wellbore[],
  selectedWellboreIds: SelectedMap
) => {
  return selectedWellboreList.reduce(
    (result, item) => ({ ...result, [item.id]: true }),
    {
      ...Object.keys(selectedWellboreIds).reduce(
        (result, item) => ({ ...result, [item]: false }),
        {}
      ),
    }
  );
};
