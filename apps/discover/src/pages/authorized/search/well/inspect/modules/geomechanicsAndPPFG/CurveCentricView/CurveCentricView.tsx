import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { BooleanMap } from 'utils/booleanMap';

import { useDeepMemo } from 'hooks/useDeep';
import { wellInspectActions } from 'modules/wellInspect/actions';

import { MeasurementsView, MeasurementUnits } from '../types';
import { getCurveCentricViewCharts } from '../utils/getCurveCentricViewCharts';

import { CurveCentricViewCard } from './CurveCentricViewCard';
import { CurveCentricViewWrapper } from './elements';

export interface CurveCentricViewProps {
  data: MeasurementsView[];
  curveSelection: BooleanMap;
  measurementUnits: MeasurementUnits;
}

export const CurveCentricView: React.FC<CurveCentricViewProps> = ({
  data,
  curveSelection,
  measurementUnits,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(wellInspectActions.setColoredWellbores(true));
    return () => {
      dispatch(wellInspectActions.setColoredWellbores(false));
    };
  }, []);

  const charts = useDeepMemo(
    () => getCurveCentricViewCharts(data, measurementUnits),
    [data, measurementUnits]
  );

  return (
    <CurveCentricViewWrapper>
      {Object.keys(charts).map((columnExternalId) => (
        <CurveCentricViewCard
          key={columnExternalId}
          data={charts[columnExternalId]}
          measurementUnits={measurementUnits}
          visible={curveSelection[columnExternalId]}
        />
      ))}
    </CurveCentricViewWrapper>
  );
};
