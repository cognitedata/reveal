import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import isEmpty from 'lodash/isEmpty';
import { areAllSetValuesEmpty } from 'utils/areAllSetValuesEmpty';

import { PerfMetrics } from '@cognite/metrics';
import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import { NoDataAvailable } from 'components/Charts/common/NoDataAvailable';
import { Loading } from 'components/Loading';
import {
  PerformanceMetricsObserver,
  PerformanceObserved,
  measurementsPageLoadQuery,
} from 'components/Performance';
import { DepthMeasurementUnit, PressureUnit } from 'constants/units';
import { inspectTabsActions } from 'modules/inspectTabs/actions';
import { useMeasurementsQuery } from 'modules/wellSearch/hooks/useMeasurementsQuery';
import { FlexGrow } from 'styles/layout';

import {
  DEFAULT_MEASUREMENTS_REFERENCE,
  DEFAULT_PRESSURE_UNIT,
} from './constants';
import CurveCentricView from './curveCentricView/CurveCentricView';
import { MeasurementsTopBar, MeasurementsWrapper } from './elements';
import { GeomechanicsCurveFilter } from './filters/GeomechanicsCurveFilter';
import { OtherFilter } from './filters/OtherFilter';
import { PPFGCurveFilter } from './filters/PPFGCurveFilter';
import { UnitSelector } from './filters/UnitSelector';
import { ViewModeSelector } from './filters/ViewModeSelector';
import { getMeasurementDataFetchErrors } from './utils';
import WellCentricView from './wellCentricView/WellCentricView';

export const MeasurementsComponent: React.FC = () => {
  const dispatch = useDispatch();
  const [viewMode, setViewMode] = useState<string>('Wells');
  const [geomechanicsCurves, setGeomechanicsCurves] = useState<
    DepthMeasurementColumn[]
  >([]);
  const [ppfgCurves, setPPFGCurves] = useState<DepthMeasurementColumn[]>([]);
  const [otherTypes, setOtherTypes] = useState<DepthMeasurementColumn[]>([]);
  const [pressureUnit, setPressureUnit] = useState<PressureUnit>(
    DEFAULT_PRESSURE_UNIT
  );
  const [measurementReference, setMeasurementReference] =
    useState<DepthMeasurementUnit>(DEFAULT_MEASUREMENTS_REFERENCE);

  const { isLoading, data } = useMeasurementsQuery();

  useEffect(() => {
    if (!data) return;
    const wellboreErrors = getMeasurementDataFetchErrors(data);

    if (!isEmpty(wellboreErrors)) {
      dispatch(inspectTabsActions.setErrors(wellboreErrors));
    }
  }, [JSON.stringify(data)]);

  if (isLoading) {
    return <Loading />;
  }

  if (data && areAllSetValuesEmpty(data)) {
    return <NoDataAvailable />;
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
        <OtherFilter selectedCurves={otherTypes} onChange={setOtherTypes} />
        <UnitSelector
          unit={pressureUnit}
          reference={measurementReference}
          onUnitChange={setPressureUnit}
          onReferenceChange={setMeasurementReference}
        />
      </MeasurementsTopBar>

      {viewMode === 'Wells' ? (
        <WellCentricView
          geomechanicsCurves={geomechanicsCurves}
          ppfgCurves={ppfgCurves}
          otherTypes={otherTypes}
          pressureUnit={pressureUnit}
          measurementReference={measurementReference}
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
