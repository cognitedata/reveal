import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';
import { adaptToMultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/utils';

import { NptInternal } from '../types';

export const adaptNptEventsToMultiSelect = (
  nptEvents: NptInternal[]
): MultiSelectCategorizedOptionMap => {
  return adaptToMultiSelectCategorizedOptionMap(nptEvents, {
    category: 'nptCode',
    options: 'nptCodeDetail',
    checkboxColor: 'nptCodeColor',
  });
};
