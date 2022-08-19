import { filterNdsEventsByRiskTypesSelection } from 'domain/wells/nds/internal/selectors/filterNdsEventsByRiskTypesSelection';
import { NdsRiskTypesSelection } from 'domain/wells/nds/internal/types';
import { filterNptEventsByCodeSelection } from 'domain/wells/npt/internal/selectors/filterNptEventsByCodeSelection';
import { NptCodesSelection } from 'domain/wells/npt/internal/types';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import isEmpty from 'lodash/isEmpty';
import { BooleanMap } from 'utils/booleanMap';

import EmptyState from 'components/EmptyState';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';
import { inspectTabsActions } from 'modules/inspectTabs/actions';
import { FlexGrow } from 'styles/layout';

import { NdsRiskTypesFilter } from '../common/Events/NdsRiskTypesFilter';
import { NptCodesFilter } from '../common/Events/NptCodesFilter';
import { ViewModeControl } from '../common/ViewModeControl';

import { CompareView } from './CompareView';
import { MEASUREMENTS_UNIT_SELECTOR_OPTIONS } from './config/measurementUnits';
import { CurveCentricView } from './CurveCentricView';
import { TopContentWrapper } from './elements';
import { useMeasurementsData } from './hooks/useMeasurementsData';
import { useMeasurementUnits } from './hooks/useMeasurementUnits';
import { CurveFilters, MeasurementUnitsSelector } from './TopContent';
import { WellWellboreSelection, ViewModes } from './types';
import { getCompareViewData } from './utils/getCompareViewData';
import { WellCentricView } from './WellCentricView';

export const GeomechanicsAndPPFG: React.FC = () => {
  const dispatch = useDispatch();

  const {
    isLoading,
    data,
    nptEvents,
    ndsEvents,
    curveFilterOptions,
    nptEventsFilterOptions,
    ndsEventsFilterOptions,
    errors,
  } = useMeasurementsData();

  const [viewMode, setViewMode] = useState<ViewModes>(ViewModes.Wells);
  const [measurementUnits, setMeasurementUnits] = useMeasurementUnits();

  const [curveSelection, setCurveSelection] = useState<BooleanMap>({});
  const [nptCodesSelecton, setNptCodesSelection] = useState<NptCodesSelection>(
    {}
  );
  const [ndsRiskTypesSelection, setNdsRiskTypesSelection] =
    useState<NdsRiskTypesSelection>({});

  const [compareViewSelection, setCompareViewSelection] =
    useState<WellWellboreSelection>({});

  useDeepEffect(() => {
    dispatch(inspectTabsActions.setErrors(errors));
  }, [errors]);

  const filteredNptEvents = useDeepMemo(
    () => filterNptEventsByCodeSelection(nptEvents, nptCodesSelecton),
    [nptEvents, nptCodesSelecton]
  );

  const filteredNdsEvents = useDeepMemo(
    () => filterNdsEventsByRiskTypesSelection(ndsEvents, ndsRiskTypesSelection),
    [ndsEvents, ndsRiskTypesSelection]
  );

  const compareViewData = useDeepMemo(
    () => getCompareViewData(data, compareViewSelection),
    [data, compareViewSelection]
  );

  if (isEmpty(data) && isEmpty(compareViewSelection)) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <>
      <TopContentWrapper>
        <ViewModeControl
          views={Object.values(ViewModes)}
          selectedView={viewMode}
          onChangeView={setViewMode}
        />
        <FlexGrow />
        <CurveFilters
          options={curveFilterOptions}
          onChange={setCurveSelection}
        />
        <NptCodesFilter
          options={nptEventsFilterOptions}
          onChange={setNptCodesSelection}
        />
        <NdsRiskTypesFilter
          options={ndsEventsFilterOptions}
          onChange={setNdsRiskTypesSelection}
        />
        <MeasurementUnitsSelector
          options={MEASUREMENTS_UNIT_SELECTOR_OPTIONS}
          value={measurementUnits}
          onChange={setMeasurementUnits}
        />
      </TopContentWrapper>

      {viewMode === ViewModes.Wells && (
        <WellCentricView
          data={data}
          nptEvents={filteredNptEvents}
          ndsEvents={filteredNdsEvents}
          curveSelection={curveSelection}
          measurementUnits={measurementUnits}
          onNavigateToCompareView={setCompareViewSelection}
        />
      )}

      {viewMode === ViewModes.Curves && (
        <CurveCentricView
          data={data}
          curveSelection={curveSelection}
          measurementUnits={measurementUnits}
        />
      )}

      {!isEmpty(compareViewSelection) && (
        <CompareView
          data={compareViewData}
          isLoading={isLoading}
          measurementUnits={measurementUnits}
          compareViewSelection={compareViewSelection}
          onBackClick={() => setCompareViewSelection({})}
        />
      )}
    </>
  );
};

export default GeomechanicsAndPPFG;
