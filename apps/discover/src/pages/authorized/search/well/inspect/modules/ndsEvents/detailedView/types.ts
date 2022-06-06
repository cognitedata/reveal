import { WellboreNdsAggregatesSummary } from 'domain/wells/dataLayer/nds/types';

import { NdsView } from '../types';

export interface DetailedViewProps {
  /**
   * All NDS events data.
   */
  data: NdsView[];
  /**
   * NDS events data of the selected wellbore only.
   */
  detailedViewNdsData?: NdsView[];
  setDetailedViewNdsData: (detailedViewNdsData?: NdsView[]) => void;
  ndsAggregate: WellboreNdsAggregatesSummary;
}
