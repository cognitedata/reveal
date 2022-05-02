import React from 'react';

import { useClearAllFilters } from 'services/savedSearches/hooks/useClearAllFilters';
import { useClearPolygon } from 'services/savedSearches/hooks/useClearPolygon';
import { useClearQuery } from 'services/savedSearches/hooks/useClearQuery';

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
