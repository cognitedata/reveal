import { ClearTag } from 'components/tag/ClearTag';
import { FilterTag } from 'components/tag/FilterTag';

import { WellAppliedFilters } from './WellAppliedFilters';

export const SidebarWellAppliedFilters: React.FC = () => {
  return (
    <>
      <WellAppliedFilters
        filterTagComponent={FilterTag}
        clearTagComponent={ClearTag}
        showClearTag
      />
    </>
  );
};
