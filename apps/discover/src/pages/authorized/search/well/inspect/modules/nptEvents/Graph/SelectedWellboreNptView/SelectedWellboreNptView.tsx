import { groupByWellboreName } from 'domain/wells/well/internal/transformers/groupByWellboreName';

import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react';

import get from 'lodash/get';
import head from 'lodash/head';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';

import { WhiteLoaderOverlay } from 'components/Loading';
import { OverlayNavigation } from 'components/OverlayNavigation';
import { EMPTY_ARRAY } from 'constants/empty';

import { accessors } from '../../constants';
import { NptView } from '../../types';
import { SelectedWellbore } from '../types';

import { SelectedWellboreDataContainer, Separator } from './elements';
import { NavigationPanel, NavigationPanelData } from './NavigationPanel';
import { NPTDurationGraph } from './NPTDurationGraph';
import { NPTEventsGraph } from './NPTEventsGraph';
import { NPTEventsTable } from './NPTEventsTable';
import { useDataLayer } from './useDataLayer';

interface Props {
  data: NptView[];
  selectedWellbore?: SelectedWellbore;
  setSelectedWellbore?: (selectedWellbore?: SelectedWellbore) => void;
  disableWellboreNavigation?: boolean;
}

const getSelectedWellboreName = (selectedWellbore?: SelectedWellbore) => {
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
    const { nptCodeDefinitions } = useDataLayer();

    const groupedEvents = useMemo(() => groupByWellboreName(data), [data]);

    const wellboreName = getSelectedWellboreName(selectedWellbore);

    useEffect(() => {
      if (!selectedWellbore) return;

      setChartRendering(true);

      chartData.current = get(
        groupedEvents,
        wellboreName!,
        EMPTY_ARRAY as NptView[]
      );

      setTimeout(() => {
        setChartRendering(false);
      });
    }, [wellboreName, groupedEvents, selectedWellbore]);

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
          <NavigationPanel
            data={navigationPanelData}
            onChangeSelectedWellbore={handleChangeSelectedWellbore}
            onCloseSelectedWellboreView={handleCloseSelectedWellboreView}
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
