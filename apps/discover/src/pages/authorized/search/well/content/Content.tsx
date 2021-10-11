import React from 'react';

import { useClearWellsFilters } from 'modules/api/savedSearches/hooks/useClearWellsFilters';
import { useWells } from 'modules/wellSearch/selectors';
import { ContentWrapper } from 'pages/authorized/search/elements';

import { WellResultTable } from './result';
import { WellSearchFrontPage } from './WellSearchFrontPage';

export const WellContent: React.FC = () => {
  const { wells, currentQuery, isSearching } = useWells();
  const clearWellsFilters = useClearWellsFilters();

  /**
   * This block is triggered when no any wells filters have been applied or anything is not searched in wells.
   * This prevents the blank results screen in the above case. (PP-1267)
   * Clear wells filters and load the results set.
   */
  React.useEffect(() => {
    if (!isSearching && !currentQuery.hasSearched) {
      clearWellsFilters();
    }
  }, [isSearching, currentQuery.hasSearched]);

  if (wells.length === 0 || isSearching) {
    return (
      <ContentWrapper>
        <WellSearchFrontPage />
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <WellResultTable />
    </ContentWrapper>
  );
};

export default WellContent;
