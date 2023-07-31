import { WellboreNdsAggregatesSummary } from 'domain/wells/nds/internal/types';

import { NdsView } from '../../types';

export interface DetailedViewProps {
  data?: NdsView[];
  ndsAggregate: WellboreNdsAggregatesSummary;
  isPreviousButtonDisabled?: boolean;
  isNextButtonDisabled?: boolean;
  onPreviousClick?: () => void;
  onNextClick?: () => void;
  onBackClick: () => void;
}
