import { storage } from '@cognite/react-container';

import { toBooleanMap } from 'modules/wellSearch/utils';
import { columns } from 'pages/authorized/search/well/inspect/modules/relatedDocument/constant';

import { WELL_SELECTED_RELATED_DOCUMENTS_COLUMNS } from './actions';
import { BooleanSelection } from './types';

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
