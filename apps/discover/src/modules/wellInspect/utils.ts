import isEmpty from 'lodash/isEmpty';
import pickBy from 'lodash/pickBy';

import { storage } from '@cognite/react-container';

import { WellboreId } from 'modules/wellSearch/types';
import { toBooleanMap } from 'modules/wellSearch/utils';
import { columns } from 'pages/authorized/search/well/inspect/modules/relatedDocument/constant';

import { WELL_SELECTED_RELATED_DOCUMENTS_COLUMNS } from './actions';
import { BooleanSelection, WellSequenceData } from './types';

export const getBooleanSelection = (
  array: (string | number)[],
  value: boolean
): BooleanSelection => {
  return array.reduce<BooleanSelection>(
    (booleanSelection, key) => ({
      ...booleanSelection,
      [key]: value,
    }),
    {}
  );
};

export const getInitialSelectedRelatedDocumentsColumns =
  (): BooleanSelection => {
    return (
      storage.getItem(WELL_SELECTED_RELATED_DOCUMENTS_COLUMNS) ||
      toBooleanMap(Object.keys(columns))
    );
  };

export const filterWellSequenceDataByWellboreIds = (
  wellSequenceData: WellSequenceData,
  wellboreIds: WellboreId[]
) => {
  if (isEmpty(wellboreIds)) {
    return wellSequenceData;
  }
  return pickBy(wellSequenceData, (_, wellboreId) =>
    // @sdk-wells-v3
    wellboreIds.map(String).includes(String(wellboreId))
  );
};
