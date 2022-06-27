import { useNptDefinitions } from 'domain/wells/npt/internal/hooks/useNptDefinitions';

import React, { useCallback, useState, useRef } from 'react';

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
  setSelectedWellbore?: (selectedWellbore?: SelectedWellbore) => void;
  disableWellboreNavigation?: boolean;
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
    setSelectedWellbore,
    disableWellboreNavigation,
  }) => {
    const [chartRendering, setChartRendering] = useState<boolean>(false);
    const chartData = useRef<NptView[]>(EMPTY_ARRAY);
    const { nptCodeDefinitions } = useNptDefinitions();

    const currentWellboreName = getWellboreName(selectedWellbore);

    const handleChangeSelectedWellbore = useCallback(
      ({ data, wellboreName }: { data: NptView[]; wellboreName: string }) => {
        setChartRendering(true);
        setSelectedWellbore?.(wellboreName);
        chartData.current = data;
        setTimeout(() => setChartRendering(false));
      },
      [setSelectedWellbore]
    );

    const handleCloseSelectedWellboreView = useCallback(() => {
      chartData.current = EMPTY_ARRAY;
      setSelectedWellbore?.(undefined);
    }, [setSelectedWellbore]);

    return (
      <>
        <OverlayNavigation
          backgroundInvisibleMount
          mount={Boolean(selectedWellbore)}
        >
          <WellboreNavigationPanel
            data={data}
            currentWellboreName={currentWellboreName}
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
