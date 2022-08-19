import { NdsInternal } from 'domain/wells/nds/internal/types';
import { NptInternal } from 'domain/wells/npt/internal/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import React, { useState } from 'react';

import { BooleanMap } from 'utils/booleanMap';

import { useDeepMemo } from 'hooks/useDeep';

import { BulkActions } from '../components/BulkActions';
import {
  MeasurementsView,
  MeasurementUnits,
  WellWellboreSelection,
} from '../types';

import { WellCentricViewWrapper } from './elements';
import { WellCentricViewCard } from './WellCentricViewCard';

export interface WellCentricViewProps {
  data: MeasurementsView[];
  nptEvents: NptInternal[];
  ndsEvents: NdsInternal[];
  curveSelection: BooleanMap;
  measurementUnits: MeasurementUnits;
  onNavigateToCompareView: (
    compareViewSelection: WellWellboreSelection
  ) => void;
}

export const WellCentricView: React.FC<WellCentricViewProps> = ({
  data,
  nptEvents,
  ndsEvents,
  curveSelection,
  measurementUnits,
  onNavigateToCompareView,
}) => {
  const [wellWellboreSelection, setWellWellboreSelection] =
    useState<WellWellboreSelection>({});
  const [wellboreSelection, setWellboreSelection] = useState<BooleanMap>({});

  const groupedNptEvents = useDeepMemo(
    () => groupByWellbore(nptEvents),
    [nptEvents]
  );

  const groupedNdsEvents = useDeepMemo(
    () => groupByWellbore(ndsEvents),
    [ndsEvents]
  );

  const handleSelectWellbore = (
    wellName: string,
    wellboreMatchingId: string,
    isSelected: boolean
  ) => {
    const currentWellbores = wellWellboreSelection[wellName] || [];

    const updatedWellbores = isSelected
      ? [...currentWellbores, wellboreMatchingId]
      : currentWellbores.filter((id) => id !== wellboreMatchingId);

    setWellWellboreSelection((wellWellboreSelection) => ({
      ...wellWellboreSelection,
      [wellName]: updatedWellbores,
    }));
    setWellboreSelection((wellboreSelection) => ({
      ...wellboreSelection,
      [wellboreMatchingId]: isSelected,
    }));
  };

  const handleClickCompare = () => {
    onNavigateToCompareView(wellWellboreSelection);
  };

  const handleCloseBulkActions = () => {
    setWellWellboreSelection({});
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
        wellWellboreSelection={wellWellboreSelection}
        onClickCompare={handleClickCompare}
        onClose={handleCloseBulkActions}
      />
    </>
  );
};
