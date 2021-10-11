import { ClearTag } from 'components/tag/ClearTag';
import { FilterTag } from 'components/tag/FilterTag';

import {
  DocumentAppliedFilters,
  ClearAllScenarios,
} from './DocumentAppliedFilters';

export const SidebarDocumentAppliedFilters: React.FC = () => {
  return (
    <>
      <DocumentAppliedFilters
        filterTagComponent={FilterTag}
        clearTagComponent={ClearTag}
        showClearTag
        showClearTagForScenarios={ClearAllScenarios.FILTERS}
      />
    </>
  );
};
