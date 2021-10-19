import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { OverlayNavigation } from 'components/overlay-navigation';
import { useNPTGraphSelectedWellboreData } from 'modules/wellInspect/selectors';

import { NavigationPanel } from './NavigationPanel';
import { NPTDurationGraph } from './NPTDurationGraph';
import { NPTEventsTable } from './NPTEventsTable';

export const SelectedWellboreView: React.FC = () => {
  const selectedWellboreData = useNPTGraphSelectedWellboreData();

  return (
    <OverlayNavigation mount={!isEmpty(selectedWellboreData)}>
      <NavigationPanel />
      <NPTDurationGraph />
      <NPTEventsTable />
    </OverlayNavigation>
  );
};
