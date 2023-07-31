import * as React from 'react';

import { CommonCurveFilter } from '../../components/CommonCurveFilter';
import { CurvesFilterType } from '../../types';

import { CurveFilterProps } from './types';

export const PpfgCurvesFilter: React.FC<CurveFilterProps> = ({
  options,
  onChange,
}) => {
  return (
    <CommonCurveFilter
      title={CurvesFilterType.PPFG}
      options={{ Curves: options }}
      onChange={onChange}
    />
  );
};
