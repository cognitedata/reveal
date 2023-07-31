import { MultiSelectOptionObject } from 'components/Filters/MultiSelect/types';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';

import { NptInternal } from '../types';

export const filterNptBySelectedEvents = (
  events: NptInternal[],
  selectedEvents: MultiSelectCategorizedOptionMap
): NptInternal[] => {
  return (events || []).filter((nptEvent) => {
    const hasNptCode = nptEvent.nptCode;

    const hasNptCodeInSelectedEvents =
      hasNptCode && selectedEvents[nptEvent.nptCode];

    const hasNptCodeDetailInSelectedEventsForNptCode =
      hasNptCode &&
      selectedEvents[nptEvent.nptCode]?.some(
        (item) =>
          (item as MultiSelectOptionObject).value === nptEvent.nptCodeDetail
      );

    return (
      hasNptCode &&
      hasNptCodeInSelectedEvents &&
      hasNptCodeDetailInSelectedEventsForNptCode
    );
  });
};
