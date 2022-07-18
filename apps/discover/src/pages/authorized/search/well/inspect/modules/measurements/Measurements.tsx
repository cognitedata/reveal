import { DepthMeasurementDataColumnInternal } from 'domain/wells/measurements/internal/types';

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import isEmpty from 'lodash/isEmpty';

import { PerfMetrics } from '@cognite/metrics';

import EmptyState from 'components/EmptyState';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';
import { LOADING_TEXT } from 'components/Loading/constants';
import {
  PerformanceMetricsObserver,
  PerformanceObserved,
  measurementsPageLoadQuery,
} from 'components/Performance';
import { DepthMeasurementUnit, PressureUnit } from 'constants/units';
import { inspectTabsActions } from 'modules/inspectTabs/actions';
import { FlexGrow } from 'styles/layout';

import {
  DEFAULT_MEASUREMENTS_REFERENCE,
  DEFAULT_PRESSURE_UNIT,
} from './constants';
import CurveCentricView from './curveCentricView/CurveCentricView';
import { MeasurementsTopBar, MeasurementsWrapper } from './elements';
import { EventNdsFilter } from './filters/EventNdsFilter';
import { EventNptFilter } from './filters/EventNptFilter';
import { GeomechanicsCurveFilter } from './filters/GeomechanicsCurveFilter';
import { OtherFilter } from './filters/OtherFilter';
import { PPFGCurveFilter } from './filters/PPFGCurveFilter';
import { UnitSelector } from './filters/UnitSelector';
import { ViewModeSelector } from './filters/ViewModeSelector';
import { useMeasurementsData } from './hooks/useMeasurementsData';
import { getMeasurementDataFetchErrors } from './utils';
import WellCentricView from './wellCentricView/WellCentricView';

export const MeasurementsComponent: React.FC = () => {
  const dispatch = useDispatch();
  const [viewMode, setViewMode] = useState<string>('Wells');
  const [geomechanicsCurves, setGeomechanicsCurves] = useState<
    DepthMeasurementDataColumnInternal[]
  >([]);
  const [ppfgCurves, setPPFGCurves] = useState<
    DepthMeasurementDataColumnInternal[]
  >([]);
  const [otherTypes, setOtherTypes] = useState<
    DepthMeasurementDataColumnInternal[]
  >([]);
  const [nptEvents, setNptEvents] = useState<MultiSelectCategorizedOptionMap>(
    {}
  );
  const [ndsEvents, setNdsEvents] = useState<MultiSelectCategorizedOptionMap>(
    {}
  );
  const [pressureUnit, setPressureUnit] = useState<PressureUnit>(
    DEFAULT_PRESSURE_UNIT
  );
  const [measurementReference] = useState<DepthMeasurementUnit>(
    DEFAULT_MEASUREMENTS_REFERENCE
  );

  const { isLoading, data, groupedData } = useMeasurementsData();

  useEffect(() => {
    if (isEmpty(data)) return;
    const wellboreErrors = getMeasurementDataFetchErrors(groupedData);
    if (!isEmpty(wellboreErrors)) {
      dispatch(inspectTabsActions.setErrors(wellboreErrors));
    }
  }, [JSON.stringify(data)]);

  if (isEmpty(data)) {
    return <EmptyState isLoading={isLoading} loadingSubtitle={LOADING_TEXT} />;
  }

  return (
    <MeasurementsWrapper>
      <MeasurementsTopBar>
        <ViewModeSelector onChange={setViewMode} activeViewMode={viewMode} />
        <FlexGrow />
        <GeomechanicsCurveFilter
          selectedCurves={geomechanicsCurves}
          onChange={setGeomechanicsCurves}
        />
        <PPFGCurveFilter selectedCurves={ppfgCurves} onChange={setPPFGCurves} />
        <EventNptFilter selectedEvents={nptEvents} onChange={setNptEvents} />
        <EventNdsFilter selectedEvents={ndsEvents} onChange={setNdsEvents} />
        <OtherFilter selectedCurves={otherTypes} onChange={setOtherTypes} />
        <UnitSelector
          unit={pressureUnit}
          // reference={measurementReference}
          onUnitChange={setPressureUnit}
          // onReferenceChange={setMeasurementReference}
        />
      </MeasurementsTopBar>

      {viewMode === 'Wells' ? (
        <WellCentricView
          geomechanicsCurves={geomechanicsCurves}
          ppfgCurves={ppfgCurves}
          otherTypes={otherTypes}
          pressureUnit={pressureUnit}
          measurementReference={measurementReference}
          nptEvents={nptEvents}
          ndsEvents={ndsEvents}
        />
      ) : (
        <CurveCentricView
          geomechanicsCurves={geomechanicsCurves}
          ppfgCurves={ppfgCurves}
          otherTypes={otherTypes}
          pressureUnit={pressureUnit}
          measurementReference={measurementReference}
        />
      )}
    </MeasurementsWrapper>
  );
};

export const Measurements: React.FC = () => {
  const handlePerformanceObserved = ({ mutations }: PerformanceObserved) => {
    if (mutations) {
      PerfMetrics.findInMutation({
        ...measurementsPageLoadQuery,
        mutations,
        callback: (_output: any) =>
          PerfMetrics.trackPerfEnd('MEASUREMENTS_PAGE_LOAD'),
      });
    }
  };
  return (
    <PerformanceMetricsObserver onChange={handlePerformanceObserved}>
      <MeasurementsComponent />
    </PerformanceMetricsObserver>
  );
};

export default Measurements; // for lazy loading
