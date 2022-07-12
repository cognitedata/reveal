import React, { useCallback, useEffect, useState } from 'react';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';

import { WhiteLoaderOverlay } from 'components/Loading';
import { OverlayNavigation } from 'components/OverlayNavigation';
import { useDeepMemo } from 'hooks/useDeep';

import { WellboreNavigationPanel } from '../../../common/WellboreNavigationPanel';
import { useNptDataForSelectedWellbore } from '../../hooks/useNptDataForSelectedWellbore';

import { SelectedWellboreDataContainer, Separator } from './elements';
import { NPTDurationGraph } from './NPTDurationGraph';
import { NPTEventsGraph } from './NPTEventsGraph';
import { NPTEventsTable } from './NPTEventsTable';

interface Props {
  selectedWellboreId?: string;
  wellboreIdsToNavigate?: string[];
  onCloseSelectedWellboreNptViewClick: () => void;
}

export const SelectedWellboreNptView: React.FC<Props> = React.memo(
  ({
    selectedWellboreId,
    wellboreIdsToNavigate,
    onCloseSelectedWellboreNptViewClick,
  }) => {
    const [currentWellboreId, setCurrentWellboreId] = useState<string>();
    const [chartRendering, setChartRendering] = useState<boolean>(false);

    const { data, isLoading, nptCodeDefinitions } =
      useNptDataForSelectedWellbore(currentWellboreId);

    useEffect(
      () => setCurrentWellboreId(selectedWellboreId),
      [selectedWellboreId]
    );

    const handleCloseSelectedWellboreView = useCallback(() => {
      setCurrentWellboreId(undefined);
      onCloseSelectedWellboreNptViewClick();
    }, []);

    const handleChangeSelectedWellbore = useCallback((wellboreId: string) => {
      setChartRendering(true);
      setTimeout(() => {
        setCurrentWellboreId(wellboreId);
        setChartRendering(false);
      });
    }, []);

    const Content = useDeepMemo(() => {
      return (
        <SelectedWellboreDataContainer>
          <NPTDurationGraph
            data={data}
            nptCodeDefinitions={nptCodeDefinitions}
          />
          <Separator />
          <NPTEventsGraph data={data} nptCodeDefinitions={nptCodeDefinitions} />
          <NPTEventsTable data={data} />
        </SelectedWellboreDataContainer>
      );
    }, [data, nptCodeDefinitions]);

    return (
      <>
        <OverlayNavigation
          backgroundInvisibleMount
          mount={Boolean(currentWellboreId)}
        >
          <WellboreNavigationPanel
            data={head(data)}
            wellboreIds={wellboreIdsToNavigate}
            onNavigate={handleChangeSelectedWellbore}
            onBackClick={handleCloseSelectedWellboreView}
            disableNavigation={isEmpty(wellboreIdsToNavigate)}
          />
          {Content}
        </OverlayNavigation>

        {(isLoading || chartRendering) && <WhiteLoaderOverlay />}
      </>
    );
  }
);
