import { NdsAggregate } from '@cognite/sdk-wells-v3';

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
  ndsAggregate?: NdsAggregate;
}
