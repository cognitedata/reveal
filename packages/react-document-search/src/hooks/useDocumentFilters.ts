import { useContext } from 'react';

import { DocumentSearchContext } from '../providers';

export const useDocumentFilters = () => {
  const { appliedFilters, setAppliedFilters } = useContext(
    DocumentSearchContext
  );

  return { appliedFilters, setAppliedFilters };
};
