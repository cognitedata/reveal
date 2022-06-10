import { useOtherFilterOptions } from 'domain/wells/measurements/internal/hooks/useOtherFilterOptions';

import React from 'react';

import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import { useDeepEffect } from 'hooks/useDeep';

import { CommonCurveFilter } from './CommonCurveFilter';
import { mapCurvesToOptions } from './utils';

interface Props {
  selectedCurves: DepthMeasurementColumn[];
  onChange: (curves: DepthMeasurementColumn[]) => void;
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
