import React from 'react';

import { TableEmpty } from 'components/tableEmpty';
import { useClearAllFilters } from 'modules/api/savedSearches/hooks/useClearAllFilters';
import { useClearPolygon } from 'modules/api/savedSearches/hooks/useClearPolygon';
import { useClearQuery } from 'modules/api/savedSearches/hooks/useClearQuery';

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
