import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';

import { NdsInternal } from '../types';

export const filterNdsBySelectedEvents = (
  events: NdsInternal[],
  selectedEvents: MultiSelectCategorizedOptionMap
): NdsInternal[] =>
  events?.filter(
    (ndsEvent) => ndsEvent.riskType && !!selectedEvents[ndsEvent.riskType]
  );
