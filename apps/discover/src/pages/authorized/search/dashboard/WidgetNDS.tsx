import * as React from 'react';

import { Well, Wellbore } from '@cognite/sdk-wells-v3';

import { useAllNdsCursorsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';
import { useAllWellSearchResultQuery } from 'modules/wellSearch/hooks/useWellSearchResultQuery';

import { Widget } from './Widget';
import { WidgetContentCalculator } from './WidgetContentCalculator';

const getWellboresFromWellsList = (
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

export const WidgetNDS: React.FC = () => {
  //   const wellboreSourceExternalIdMap = useActiveWellboresSourceExternalIdMap();
  const { data: wells, isLoading: isLoadingWells } =
    useAllWellSearchResultQuery();
  const safeWells: Well[] = (wells as unknown as Well[]) || [];
  const { data, isLoading } = useAllNdsCursorsQuery({
    wellboreIds: getWellboresFromWellsList(safeWells),
  });
  // console.log('Wells', wells);
  // console.log('Total nds events:', data?.length);

  const wellboresFromSearch = new Set();
  safeWells.forEach((item) =>
    item.wellbores?.forEach((wellbore) =>
      wellboresFromSearch.add(wellbore.matchingId)
    )
  );
  // console.log('WellboresFromSearch', wellboresFromSearch);
  // console.log('Total wellsbores:', wellboresFromSearch.size);

  const wellboresFromNDSEvent = new Set();
  data?.forEach((wellbore) =>
    wellboresFromNDSEvent.add(wellbore.wellboreMatchingId)
  );
  // console.log('WellboresWithNDSData', wellboresFromNDSEvent.size);

  return (
    <Widget title="NDS" subtitle="data availability">
      <WidgetContentCalculator
        singleData={wellboresFromNDSEvent}
        singleDataLoading={isLoading}
        completeData={wellboresFromSearch}
        completeDataLoading={isLoadingWells}
      />
    </Widget>
  );
};
