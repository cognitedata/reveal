import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';
import { MultiSelectOptionObject } from 'components/Filters/types';

import { NdsInternal } from '../types';

export const filterNdsBySelectedEvents = (
  events: NdsInternal[],
  selectedEvents: MultiSelectCategorizedOptionMap
): NdsInternal[] =>
  (events || []).filter((ndsEvent) => {
    const hasRiskType = ndsEvent.riskType;

    const hasRiskTypeInSelectedEvents =
      hasRiskType && selectedEvents[ndsEvent.riskType!];

    const hasSubtypeInSelectedEventsForRiskType =
      hasRiskType &&
      selectedEvents[ndsEvent.riskType!]?.some(
        (item) => (item as MultiSelectOptionObject).value === ndsEvent.subtype
      );

    return (
      hasRiskType &&
      hasRiskTypeInSelectedEvents &&
      hasSubtypeInSelectedEventsForRiskType
    );
  });
