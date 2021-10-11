import { BlueFilterTag } from 'components/tag/BlueFilterTag';
import { ClearTag } from 'components/tag/ClearTag';

import { DocumentAppliedFilters } from './DocumentAppliedFilters';

export const DocumentContentAppliedFilters: React.FC = () => {
  return (
    <>
      <DocumentAppliedFilters
        filterTagComponent={BlueFilterTag}
        clearTagComponent={ClearTag}
        showClearTag
        showGeoFilters
        showSearchPhraseTag
      />
    </>
  );
};
