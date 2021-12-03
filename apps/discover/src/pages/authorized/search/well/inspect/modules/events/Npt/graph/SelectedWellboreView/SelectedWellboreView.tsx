import React, { useCallback, useEffect, useMemo, useState } from 'react';

import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import head from 'lodash/head';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';

import { WhiteLoaderOverlay } from 'components/loading';
import { OverlayNavigation } from 'components/overlay-navigation';
import { NPTEvent } from 'modules/wellSearch/types';

import { accessors } from '../../constants';
import { SelectedWellbore } from '../types';

import { Separator } from './elements';
import { NavigationPanel, NavigationPanelData } from './NavigationPanel';
import { NPTDurationGraph } from './NPTDurationGraph';
import { NPTEventsGraph } from './NPTEventsGraph';
import { NPTEventsTable } from './NPTEventsTable';

interface Props {
  events: NPTEvent[];
  selectedWellbore?: SelectedWellbore;
  setSelectedWellbore?: (selectedWellbore?: SelectedWellbore) => void;
}

export const SelectedWellboreView: React.FC<Props> = React.memo(
  ({ events, selectedWellbore, setSelectedWellbore }) => {
    const [selectedWellboreViewMounted, setSelectedWellboreViewMounted] =
      useState<boolean>(false);
    const [chartRendering, setChartRendering] = useState<boolean>(false);
    const [chartData, setChartData] = useState<NPTEvent[]>([]);

    const getSelectedWellboreName = (selectedWellbore?: SelectedWellbore) => {
      if (isUndefined(selectedWellbore)) return undefined;
      if (isString(selectedWellbore)) return selectedWellbore;
      return selectedWellbore.wellboreName;
    };

    const updateChartData = (selectedWellbore: SelectedWellbore) => {
      const wellboreName = getSelectedWellboreName(selectedWellbore)!;
      const selectedWellboreEvents = get(
        groupedEvents,
        wellboreName,
        [] as NPTEvent[]
      );
      setChartData(selectedWellboreEvents);
    };

    const handleChangeSelectedWellbore = useCallback(
      (selectedWellbore: SelectedWellbore) => {
        setChartRendering(true);
        setTimeout(() => {
          updateChartData(selectedWellbore);
          if (setSelectedWellbore) setSelectedWellbore(selectedWellbore);
          setTimeout(() => setChartRendering(false));
        });
      },
      []
    );

    const handleCloseSelectedWellboreView = useCallback(() => {
      setSelectedWellboreViewMounted(false);
      if (setSelectedWellbore) setTimeout(() => setSelectedWellbore(undefined));
    }, []);

    const wellboreName = getSelectedWellboreName(selectedWellbore);
    const wellName = get(head(chartData), accessors.WELL_NAME) as string;
    const index = get(selectedWellbore, 'index', -1);

    const navigationPanelData = {
      wellboreName,
      wellName,
      index,
    } as NavigationPanelData;

    const disableWellboreNavigation = useMemo(
      () => isString(selectedWellbore),
      [wellboreName]
    );

    const groupedEvents = useMemo(
      () => groupBy(events, accessors.WELLBORE_NAME),
      [JSON.stringify(events)]
    );

    useEffect(() => {
      if (!selectedWellboreViewMounted && selectedWellbore) {
        setSelectedWellboreViewMounted(true);
        updateChartData(selectedWellbore);
        if (setSelectedWellbore) setSelectedWellbore(selectedWellbore);
      }
    }, [wellboreName]);

    return (
      <>
        <OverlayNavigation
          backgroundInvisibleMount
          mount={selectedWellboreViewMounted}
        >
          <NavigationPanel
            data={navigationPanelData}
            onChangeSelectedWellbore={handleChangeSelectedWellbore}
            onCloseSelectedWellboreView={handleCloseSelectedWellboreView}
            disableNavigation={disableWellboreNavigation}
          />
          <NPTDurationGraph events={chartData} />
          <Separator />
          <NPTEventsGraph events={chartData} />
          <NPTEventsTable events={chartData} />
        </OverlayNavigation>

        {chartRendering && <WhiteLoaderOverlay />}
      </>
    );
  }
);
