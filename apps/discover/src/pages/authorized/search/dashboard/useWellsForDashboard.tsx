import { Well } from '@cognite/sdk-wells-v3';

import { useAllWellSearchResultQuery } from 'modules/wellSearch/hooks/useWellSearchResultQuery';

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
