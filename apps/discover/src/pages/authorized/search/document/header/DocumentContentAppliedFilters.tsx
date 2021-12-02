import { BlueFilterTag } from 'components/tag/BlueFilterTag';
import { ClearTag } from 'components/tag/ClearTag';

import { DocumentAppliedFilters } from './DocumentAppliedFilters';

export const DocumentContentAppliedFilters: React.FC = () => (
  <DocumentAppliedFilters
    filterTagComponent={BlueFilterTag}
    clearTagComponent={ClearTag}
    showClearTag
    showGeoFilters
    showSearchPhraseTag
  />
);
