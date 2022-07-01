import { MultiSelectOptionObject } from 'components/Filters/MultiSelect/types';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';

import { NptInternal } from '../types';

export const filterNptBySelectedEvents = (
  events: NptInternal[],
  selectedEvents: MultiSelectCategorizedOptionMap
): NptInternal[] => {
  return (events || []).filter(
    (nptEvent) =>
      nptEvent.nptCode &&
      selectedEvents[nptEvent.nptCode] &&
      selectedEvents[nptEvent.nptCode]?.some(
        (item) =>
          (item as MultiSelectOptionObject).value === nptEvent.nptCodeDetail
      )
  );
};
