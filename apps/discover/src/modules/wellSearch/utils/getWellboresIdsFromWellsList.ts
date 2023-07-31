import { Well, Wellbore } from '@cognite/sdk-wells';

export const getWellboresIdsFromWellsList = (
  wells: Well[]
): Set<Wellbore['matchingId']> => {
  const wellboresFromSearch = new Set<Wellbore['matchingId']>();

  wells.forEach((item) =>
    item.wellbores?.forEach((wellbore) =>
      wellboresFromSearch.add(wellbore.matchingId)
    )
  );

  return wellboresFromSearch;
};
