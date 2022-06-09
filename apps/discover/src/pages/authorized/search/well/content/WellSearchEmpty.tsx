import { useClearAllFilters } from 'domain/savedSearches/internal/hooks/useClearAllFilters';
import { useClearPolygon } from 'domain/savedSearches/internal/hooks/useClearPolygon';
import { useClearQuery } from 'domain/savedSearches/internal/hooks/useClearQuery';

import React from 'react';

import { TableEmpty } from 'components/TableEmpty';

export const WellSearchEmpty: React.FC = () => {
  const clearAllFilters = useClearAllFilters();
  const clearPolygon = useClearPolygon();
  const clearQuery = useClearQuery();

  return (
    <TableEmpty
      clearQuery={clearQuery}
      clearAllFilters={clearAllFilters}
      clearPolygon={clearPolygon}
    />
  );
};
