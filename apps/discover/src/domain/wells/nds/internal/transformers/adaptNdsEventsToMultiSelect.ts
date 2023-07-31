import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';
import { adaptToMultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/utils';

import { NdsInternal } from '../types';

export const adaptNdsEventsToMultiSelect = (
  ndsEvents: NdsInternal[]
): MultiSelectCategorizedOptionMap => {
  return adaptToMultiSelectCategorizedOptionMap(ndsEvents, {
    category: 'riskType',
    options: 'subtype',
    checkboxColor: 'ndsCodeColor',
  });
};
