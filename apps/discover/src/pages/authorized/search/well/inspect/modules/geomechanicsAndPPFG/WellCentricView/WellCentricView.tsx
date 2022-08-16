import { filterNdsEventsByRiskTypesSelection } from 'domain/wells/nds/internal/selectors/filterNdsEventsByRiskTypesSelection';
import {
  NdsInternal,
  NdsRiskTypesSelection,
} from 'domain/wells/nds/internal/types';
import { filterNptEventsByCodeSelection } from 'domain/wells/npt/internal/selectors/filterNptEventsByCodeSelection';
import {
  NptCodesSelection,
  NptInternal,
} from 'domain/wells/npt/internal/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import React, { useState } from 'react';

import { BooleanMap } from 'utils/booleanMap';

import { useDeepMemo } from 'hooks/useDeep';

import { MeasurementsView, MeasurementUnits } from '../types';

import { BulkActions } from './BulkActions';
import { CompareView } from './CompareView';
import { WellCentricViewWrapper } from './elements';
import { WellCentricViewCard } from './WellCentricViewCard';

export interface WellCentricViewProps {
  data: MeasurementsView[];
  nptEvents: NptInternal[];
  ndsEvents: NdsInternal[];
  curveSelection: BooleanMap;
  nptCodesSelecton: NptCodesSelection;
  ndsRiskTypesSelection: NdsRiskTypesSelection;
  measurementUnits: MeasurementUnits;
}

export const WellCentricView: React.FC<WellCentricViewProps> = ({
  data,
  nptEvents,
  ndsEvents,
  curveSelection,
  nptCodesSelecton,
  ndsRiskTypesSelection,
  measurementUnits,
}) => {
  const [wellboreSelectionMap, setWellboreSelectionMap] = useState<
    Record<string, string[]>
  >({});
  const [wellboreSelection, setWellboreSelection] = useState<BooleanMap>({});
  const [compareViewData, setCompareViewData] = useState<MeasurementsView[]>(
    []
  );

  const groupedNptEvents = useDeepMemo(() => {
    return groupByWellbore(
      filterNptEventsByCodeSelection(nptEvents, nptCodesSelecton)
    );
  }, [nptEvents, nptCodesSelecton]);

  const groupedNdsEvents = useDeepMemo(() => {
    return groupByWellbore(
      filterNdsEventsByRiskTypesSelection(ndsEvents, ndsRiskTypesSelection)
    );
  }, [ndsEvents, ndsRiskTypesSelection]);

  const handleSelectWellbore = (
    wellName: string,
    wellboreMatchingId: string,
    isSelected: boolean
  ) => {
    const currentWellbores = wellboreSelectionMap[wellName] || [];

    const updatedWellbores = isSelected
      ? [...currentWellbores, wellboreMatchingId]
      : currentWellbores.filter((id) => id !== wellboreMatchingId);

    setWellboreSelectionMap((wellboreSelectionMap) => ({
      ...wellboreSelectionMap,
      [wellName]: updatedWellbores,
    }));
    setWellboreSelection((wellboreSelection) => ({
      ...wellboreSelection,
      [wellboreMatchingId]: isSelected,
    }));
  };

  const handleClickCompare = () => {
    const compareViewData = data.filter(
      ({ wellboreMatchingId }) => wellboreSelection[wellboreMatchingId]
    );
    setCompareViewData(compareViewData);
  };

  const handleCloseBulkActions = () => {
    setWellboreSelectionMap({});
    setWellboreSelection({});
  };

  return (
    <>
      <WellCentricViewWrapper>
        {data.map((measurementsView) => {
          const { wellName, wellboreMatchingId } = measurementsView;

          const wellboreNptEvents = groupedNptEvents[wellboreMatchingId] || [];
          const wellboreNdsEvents = groupedNdsEvents[wellboreMatchingId] || [];

          const onSelectWellbore = (isSelected: boolean) => {
            handleSelectWellbore(wellName, wellboreMatchingId, isSelected);
          };

          return (
            <WellCentricViewCard
              key={wellboreMatchingId}
              data={measurementsView}
              nptEvents={wellboreNptEvents}
              ndsEvents={wellboreNdsEvents}
              measurementUnits={measurementUnits}
              curveSelection={curveSelection}
              isSelected={wellboreSelection[wellboreMatchingId]}
              onSelectWellbore={onSelectWellbore}
            />
          );
        })}
      </WellCentricViewWrapper>

      <BulkActions
        wellboreSelectionMap={wellboreSelectionMap}
        onClickCompare={handleClickCompare}
        onClose={handleCloseBulkActions}
      />

      <CompareView
        data={compareViewData}
        measurementUnits={measurementUnits}
        wellboreSelectionMap={wellboreSelectionMap}
        onBackClick={() => setCompareViewData([])}
      />
    </>
  );
};
