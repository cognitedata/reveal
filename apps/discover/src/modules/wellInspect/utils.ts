import isEmpty from 'lodash/isEmpty';
import pickBy from 'lodash/pickBy';
import { toBooleanMap } from 'utils/booleanMap';

import { storage } from '@cognite/react-container';

import { columns } from 'pages/authorized/search/well/inspect/modules/relatedDocument/constant';

import { WELL_SELECTED_RELATED_DOCUMENTS_COLUMNS } from './actions';
import { BooleanSelection, StickChartsState } from './types';

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

export const selectObjectsByKey = <T extends Record<string | number, unknown>>(
  data: T,
  filterKeys: Array<keyof T>
) => {
  if (isEmpty(filterKeys)) {
    return data;
  }
  return pickBy(data, (_, key) =>
    // @sdk-wells
    filterKeys.map(String).includes(String(key))
  ) as T;
};

export const getHighlightedEventsStateKey = (
  type: 'npt' | 'nds'
  // eslint-disable-next-line consistent-return
): keyof StickChartsState => {
  switch (type) {
    case 'npt':
      return 'highlightedNpt';
    case 'nds':
      return 'highlightedNds';
  }
};
