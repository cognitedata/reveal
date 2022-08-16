import { NdsRiskTypesSelection } from 'domain/wells/nds/internal/types';
import { NptCodesSelection } from 'domain/wells/npt/internal/types';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import isEmpty from 'lodash/isEmpty';
import { BooleanMap } from 'utils/booleanMap';

import EmptyState from 'components/EmptyState';
import { LOADING_TEXT } from 'components/Loading/constants';
import { useDeepEffect } from 'hooks/useDeep';
import { inspectTabsActions } from 'modules/inspectTabs/actions';
import { FlexGrow } from 'styles/layout';

import { NdsRiskTypesFilter } from '../common/Events/NdsRiskTypesFilter';
import { NptCodesFilter } from '../common/Events/NptCodesFilter';
import { ViewModeControl } from '../common/ViewModeControl';

import { MEASUREMENTS_UNIT_SELECTOR_OPTIONS } from './config/measurementUnits';
import { CurveCentricView } from './CurveCentricView';
import { TopContentWrapper } from './elements';
import { useDefaultMeasurementUnits } from './hooks/useDefaultMeasurementUnits';
import { useMeasurementsData } from './hooks/useMeasurementsData';
import { CurveFilters, MeasurementUnitsSelector } from './TopContent';
import { ViewModes } from './types';
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

  const [curveSelection, setCurveSelection] = useState<BooleanMap>({});
  const [nptCodesSelecton, setNptCodesSelection] = useState<NptCodesSelection>(
    {}
  );
  const [ndsRiskTypesSelection, setNdsRiskTypesSelection] =
    useState<NdsRiskTypesSelection>({});
  const [measurementUnits, setMeasurementUnits] = useState(
    useDefaultMeasurementUnits()
  );

  useDeepEffect(() => {
    dispatch(inspectTabsActions.setErrors(errors));
  }, [errors]);

  if (isEmpty(data)) {
    return <EmptyState isLoading={isLoading} loadingSubtitle={LOADING_TEXT} />;
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
          nptEvents={nptEvents}
          ndsEvents={ndsEvents}
          curveSelection={curveSelection}
          nptCodesSelecton={nptCodesSelecton}
          ndsRiskTypesSelection={ndsRiskTypesSelection}
          measurementUnits={measurementUnits}
        />
      )}

      {viewMode === ViewModes.Curves && (
        <CurveCentricView
          data={data}
          curveSelection={curveSelection}
          measurementUnits={measurementUnits}
        />
      )}
    </>
  );
};

export default GeomechanicsAndPPFG;
