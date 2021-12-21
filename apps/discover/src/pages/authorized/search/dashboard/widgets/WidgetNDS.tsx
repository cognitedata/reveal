import * as React from 'react';

import { useAllNdsCursorsQuery } from 'modules/wellSearch/hooks/useAllNdsCursorsQuery';

import { useDataSourceForDashboard } from '../useDataSourceForDashboard';
import { useWellsForDashboard } from '../useWellsForDashboard';
import { Widget } from '../Widget';
import { WidgetContentCalculator } from '../WidgetContentCalculator';

export const WidgetNDS: React.FC = () => {
  const { wells, isLoadingWells, wellbores } = useWellsForDashboard();

  // conversion because we don't care about v2 wells for this:
  const { data: wellboresWithDataAvailable, isLoading } =
    useDataSourceForDashboard({
      query: useAllNdsCursorsQuery,
      wells,
    });

  const handleClick = () => {
    //
    // here we can do a refresh of the data perhaps?
    //
    // also useful for debugging:
    // console.log('data', data?.length);
    // console.log('wells', wells?.length);
    // console.log('wellboresWithDataAvailable', wellboresWithDataAvailable?.size);
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
          selectedData={wellboresWithDataAvailable}
          selectedDataLoading={isLoading}
          completeData={wellbores}
          completeDataLoading={isLoadingWells}
        />
      </Widget>
    </div>
  );
};
