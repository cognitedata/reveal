import * as React from 'react';

import { Well } from '@cognite/sdk-wells-v3';

import { useAllNdsCursorsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';
import { useAllWellSearchResultQuery } from 'modules/wellSearch/hooks/useWellSearchResultQuery';
import { getWellboresIdsFromWellsList } from 'modules/wellSearch/utils/getWellboresIdsFromWellsList';

import { Widget } from './Widget';
import { WidgetContentCalculator } from './WidgetContentCalculator';

export const WidgetNDS: React.FC = () => {
  const { data: wells, isLoading: isLoadingWells } =
    useAllWellSearchResultQuery();
  // conversion because we don't care about v2 wells for this:
  const safeWells: Well[] = (wells as unknown as Well[]) || [];
  const { data: ndsEvents, isLoading } = useAllNdsCursorsQuery({
    wellboreIds: getWellboresIdsFromWellsList(safeWells),
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
  ndsEvents?.forEach((wellbore) => {
    wellboresFromNDSEvent.add(wellbore.wellboreMatchingId);
  });
  // console.log('WellboresWithNDSData', wellboresFromNDSEvent.size);

  const handleClick = () => {
    //
    // here we can do a refresh of the data perhaps?
    //
    // also useful for debugging:
    // console.log('ndsEvents', ndsEvents?.length);
    // console.log('safeWells', safeWells?.length);
    // console.log('wellboresFromNDSEvent', wellboresFromNDSEvent?.size);
    // console.log('wellboresFromSearch', wellboresFromSearch?.size);
  };

  return (
    <div
      onClick={handleClick}
      onKeyPress={handleClick}
      role="button"
      tabIndex={0}
    >
      <Widget title="NDS" subtitle="data availability">
        <WidgetContentCalculator
          singleData={wellboresFromNDSEvent}
          singleDataLoading={isLoading}
          completeData={wellboresFromSearch}
          completeDataLoading={isLoadingWells}
        />
      </Widget>
    </div>
  );
};
