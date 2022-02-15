import React, { useCallback, useState, useEffect, useRef } from 'react';

import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import head from 'lodash/head';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';

import { WhiteLoaderOverlay } from 'components/loading';
import { OverlayNavigation } from 'components/overlay-navigation';
import { EMPTY_ARRAY } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
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
  disableWellboreNavigation?: boolean;
}

const getSelectedWellboreName = (selectedWellbore?: SelectedWellbore) => {
  if (isUndefined(selectedWellbore)) return undefined;
  if (isString(selectedWellbore)) return selectedWellbore;
  return selectedWellbore.wellboreName;
};

export const SelectedWellboreView: React.FC<Props> = React.memo(
  ({
    events,
    selectedWellbore,
    setSelectedWellbore,
    disableWellboreNavigation,
  }) => {
    const [chartRendering, setChartRendering] = useState<boolean>(false);
    const chartData = useRef<NPTEvent[]>(EMPTY_ARRAY);

    const groupedEvents = useDeepMemo(
      () => groupBy(events, accessors.WELLBORE_NAME),
      [events]
    );

    const wellboreName = getSelectedWellboreName(selectedWellbore);

    useEffect(() => {
      setChartRendering(true);

      chartData.current = get(
        groupedEvents,
        wellboreName!,
        EMPTY_ARRAY as NPTEvent[]
      );

      setTimeout(() => {
        setChartRendering(false);
      });
    }, [wellboreName, groupedEvents]);

    const index = get(selectedWellbore, 'index', -1);
    const wellName = get(
      head(chartData.current),
      accessors.WELL_NAME
    ) as string;
    const navigationPanelData = {
      wellboreName,
      wellName,
      index,
    } as NavigationPanelData;

    const handleChangeSelectedWellbore = useCallback(
      (selectedWellbore: SelectedWellbore) => {
        setSelectedWellbore?.(selectedWellbore);
      },
      []
    );

    const handleCloseSelectedWellboreView = useCallback(() => {
      chartData.current = EMPTY_ARRAY;
      setSelectedWellbore?.(undefined);
    }, []);

    return (
      <>
        <OverlayNavigation
          backgroundInvisibleMount
          mount={Boolean(selectedWellbore)}
        >
          <NavigationPanel
            data={navigationPanelData}
            onChangeSelectedWellbore={handleChangeSelectedWellbore}
            onCloseSelectedWellboreView={handleCloseSelectedWellboreView}
            disableNavigation={disableWellboreNavigation}
          />
          <NPTDurationGraph events={chartData.current} />
          <Separator />
          <NPTEventsGraph events={chartData.current} />
          <NPTEventsTable events={chartData.current} />
        </OverlayNavigation>

        {chartRendering && <WhiteLoaderOverlay />}
      </>
    );
  }
);
