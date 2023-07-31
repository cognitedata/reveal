import { useMemo } from 'react';

import { DocumentsFacets } from 'modules/documentSearch/types';
import { AppliedFilterEntries } from 'modules/sidebar/types';

export const useDocumentAppliedFilterEntries = (
  documentFacets: DocumentsFacets
) =>
  useMemo<AppliedFilterEntries[]>(
    () => Object.entries(documentFacets) as AppliedFilterEntries[],
    [documentFacets]
  );
