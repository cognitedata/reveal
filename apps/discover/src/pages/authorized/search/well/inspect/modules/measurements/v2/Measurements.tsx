import React, { useState } from 'react';

import { areAllSetValuesEmpty } from 'utils/areAllSetValuesEmpty';

import EmptyState from 'components/emptyState';
import { Loading } from 'components/loading';
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
import WellCentricView from './wellCentricView/WellCentricView';

export const Measurements: React.FC = () => {
  const [viewMode, setViewMode] = useState<string>('Wells');
  const [geomechanicsCurves, setGeomechanicsCurves] = useState<string[]>([]);
  const [ppfgCurves, setPPFGCurves] = useState<string[]>([]);
  const [otherTypes, setOtherTypes] = useState<string[]>([]);
  const [pressureUnit, setPressureUnit] = useState<string>(
    DEFAULT_PRESSURE_UNIT
  );
  const [measurementReference, setMeasurementReference] = useState<string>(
    DEFAULT_MEASUREMENTS_REFERENCE
  );

  const { isLoading, data } = useMeasurementsQuery();

  if (isLoading) {
    return <Loading />;
  }

  if (data && areAllSetValuesEmpty(data)) {
    return <EmptyState />;
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
