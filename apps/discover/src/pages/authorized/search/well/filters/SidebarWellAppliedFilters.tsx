import { ClearTag } from 'components/tag/ClearTag';
import { FilterTag } from 'components/tag/FilterTag';

import { WellAppliedFilters } from './WellAppliedFilters';

export const SidebarWellAppliedFilters: React.FC = () => (
  <WellAppliedFilters
    filterTagComponent={FilterTag}
    clearTagComponent={ClearTag}
    showClearTag
  />
);
