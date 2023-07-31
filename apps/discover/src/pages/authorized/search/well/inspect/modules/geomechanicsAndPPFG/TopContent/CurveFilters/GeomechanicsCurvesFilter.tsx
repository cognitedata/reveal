import * as React from 'react';

import { CommonCurveFilter } from '../../components/CommonCurveFilter';
import { CurvesFilterType } from '../../types';

import { CurveFilterProps } from './types';

export const GeomechanicsCurvesFilter: React.FC<CurveFilterProps> = ({
  options,
  onChange,
}) => {
  return (
    <CommonCurveFilter
      title={CurvesFilterType.GEOMECHANNICS}
      options={{ Curves: options }}
      onChange={onChange}
    />
  );
};
