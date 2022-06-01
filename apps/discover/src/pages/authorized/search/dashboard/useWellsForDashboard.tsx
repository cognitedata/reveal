import { useAllWellSearchResultQuery } from 'domain/wells/well/internal/queries/useAllWellSearchResultQuery';

import { Well } from '@cognite/sdk-wells-v3';

export const useWellsForDashboard = () => {
  const { data: wells, isLoading: isLoadingWells } =
    useAllWellSearchResultQuery();
  const safeWells: Well[] = (wells as unknown as Well[]) || [];

  const wellbores = new Set();
  safeWells.forEach((item) =>
    item.wellbores?.forEach((wellbore) => wellbores.add(wellbore.matchingId))
  );
  // console.log('WellboresFromSearch', wellboresFromSearch);
  // console.log('Total wellsbores:', wellboresFromSearch.size);

  return { wells: safeWells, isLoadingWells, wellbores };
};
