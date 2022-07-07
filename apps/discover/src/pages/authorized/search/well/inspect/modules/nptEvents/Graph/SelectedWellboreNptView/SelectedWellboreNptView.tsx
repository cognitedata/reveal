import { useNptDefinitions } from 'domain/wells/npt/internal/hooks/useNptDefinitions';

import React, { useCallback, useState, useRef, useEffect } from 'react';

import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';

import { WhiteLoaderOverlay } from 'components/Loading';
import { OverlayNavigation } from 'components/OverlayNavigation';
import { EMPTY_ARRAY } from 'constants/empty';

import { WellboreNavigationPanel } from '../../../common/WellboreNavigationPanel';
import { NptView } from '../../types';
import { SelectedWellbore } from '../types';

import { SelectedWellboreDataContainer, Separator } from './elements';
import { NPTDurationGraph } from './NPTDurationGraph';
import { NPTEventsGraph } from './NPTEventsGraph';
import { NPTEventsTable } from './NPTEventsTable';

interface Props {
  data: NptView[];
  selectedWellbore?: SelectedWellbore;
  selectedWellboreId?: string;
  disableWellboreNavigation?: boolean;
  onCloseSelectedWellboreNptViewClick: () => void;
}

const getWellboreName = (selectedWellbore?: SelectedWellbore) => {
  if (isUndefined(selectedWellbore)) return undefined;
  if (isString(selectedWellbore)) return selectedWellbore;
  return selectedWellbore.wellboreName;
};

export const SelectedWellboreNptView: React.FC<Props> = React.memo(
  ({
    data,
    selectedWellbore,
    selectedWellboreId,
    disableWellboreNavigation,
    onCloseSelectedWellboreNptViewClick,
  }) => {
    const [chartRendering, setChartRendering] = useState<boolean>(false);
    const [currentWellboreId, setCurrentWellboreId] = useState<
      string | undefined
    >(undefined);
    const chartData = useRef<NptView[]>(EMPTY_ARRAY);
    const { nptCodeDefinitions } = useNptDefinitions();

    const currentWellboreName = getWellboreName(selectedWellbore);

    const setWellboreAndChartDate = (data: NptView[], wellboreId?: string) => {
      setChartRendering(true);
      setCurrentWellboreId(wellboreId);
      chartData.current = data;
      setTimeout(() => setChartRendering(false));
    };

    useEffect(() => {
      setWellboreAndChartDate(data, selectedWellboreId);
    }, [selectedWellboreId]);

    const handleChangeSelectedWellbore = useCallback(
      ({
        data,
        wellboreMatchingId,
      }: {
        data: NptView[];
        wellboreMatchingId: string;
      }) => {
        setWellboreAndChartDate(data, wellboreMatchingId);
      },
      [selectedWellboreId]
    );

    const handleCloseSelectedWellboreView = useCallback(() => {
      chartData.current = EMPTY_ARRAY;
      setCurrentWellboreId(undefined);
      onCloseSelectedWellboreNptViewClick();
    }, [selectedWellboreId]);

    return (
      <>
        <OverlayNavigation
          backgroundInvisibleMount
          mount={Boolean(currentWellboreId)}
        >
          <WellboreNavigationPanel
            data={data}
            currentWellboreName={currentWellboreName}
            currentWellboreMatchingId={selectedWellboreId}
            onNavigate={handleChangeSelectedWellbore}
            onBackClick={handleCloseSelectedWellboreView}
            disableNavigation={disableWellboreNavigation}
          />

          <SelectedWellboreDataContainer>
            <NPTDurationGraph
              data={chartData.current}
              nptCodeDefinitions={nptCodeDefinitions}
            />
            <Separator />
            <NPTEventsGraph
              data={chartData.current}
              nptCodeDefinitions={nptCodeDefinitions}
            />
            <NPTEventsTable data={chartData.current} />
          </SelectedWellboreDataContainer>
        </OverlayNavigation>

        {chartRendering && <WhiteLoaderOverlay />}
      </>
    );
  }
);
