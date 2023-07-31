import { DepthMeasurementDataColumnInternal } from 'domain/wells/measurements/internal/types';

import * as React from 'react';

import { useDeepEffect } from 'hooks/useDeep';

import { useOtherFilterOptions } from '../hooks/useOtherFilterOptions';

import { CommonCurveFilter } from './CommonCurveFilter';
import { mapCurvesToOptions } from './utils';

interface Props {
  selectedCurves: DepthMeasurementDataColumnInternal[];
  onChange: (curves: DepthMeasurementDataColumnInternal[]) => void;
}

export const OtherFilter: React.FC<Props> = ({ selectedCurves, onChange }) => {
  const { types } = useOtherFilterOptions();

  useDeepEffect(() => {
    onChange(types);
  }, [types]);

  return (
    <CommonCurveFilter
      title="Other data:"
      options={mapCurvesToOptions(types)}
      selected={selectedCurves}
      onChange={onChange}
    />
  );
};
