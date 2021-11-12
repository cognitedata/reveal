import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { OverlayNavigation } from 'components/overlay-navigation';
import { useNPTGraphSelectedWellboreData } from 'modules/wellInspect/selectors';

import { Separator } from './elements';
import { NavigationPanel } from './NavigationPanel';
import { NPTDurationGraph } from './NPTDurationGraph';
import { NPTEventsGraph } from './NPTEventsGraph';
import { NPTEventsTable } from './NPTEventsTable';

export const SelectedWellboreView: React.FC = () => {
  const selectedWellboreData = useNPTGraphSelectedWellboreData();

  return (
    <OverlayNavigation mount={!isEmpty(selectedWellboreData)}>
      <NavigationPanel />
      <NPTDurationGraph />
      <Separator />
      <NPTEventsGraph />
      <NPTEventsTable />
    </OverlayNavigation>
  );
};
