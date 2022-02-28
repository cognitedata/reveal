import React, { useState } from 'react';

import { areAllSetValuesEmpty } from 'utils/areAllSetValuesEmpty';

import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import { NoDataAvailable } from 'components/charts/common/NoDataAvailable';
import { Loading } from 'components/loading';
import { DepthMeasurementUnit, PressureUnit } from 'constants/units';
import { useMeasurementsQuery } from 'modules/wellSearch/hooks/useMeasurementsQueryV3';
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
import WellCentricView from './wellCentricView/WellCentricView';

export const Measurements: React.FC = () => {
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
