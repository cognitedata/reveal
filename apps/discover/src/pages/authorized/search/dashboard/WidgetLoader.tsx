import * as React from 'react';

import {
  useDataSourceForDashboard,
  ValidQueryObject,
  WidgetQuery,
} from './useDataSourceForDashboard';
import { useWellsForDashboard } from './useWellsForDashboard';
import { Widget } from './Widget';
import { WidgetContentCalculator } from './WidgetContentCalculator';

interface Props<T> {
  title: string;
  query: WidgetQuery<T>;
}
export const WidgetLoader = <T extends ValidQueryObject>({
  query,
  title,
}: React.PropsWithChildren<Props<T>>) => {
  const { wells, isLoadingWells, wellbores } = useWellsForDashboard();

  const { data: wellboresWithDataAvailable, isLoading } =
    useDataSourceForDashboard({
      query,
      wells,
    });

  return (
    <Widget title={title} subtitle="data availability">
      <WidgetContentCalculator
        selectedData={wellboresWithDataAvailable}
        selectedDataLoading={isLoading}
        completeData={wellbores}
        completeDataLoading={isLoadingWells}
      />
    </Widget>
  );
};
