import React from 'react';

import { CommonCurveFilter } from '../../components/CommonCurveFilter';
import { CurvesFilterType } from '../../types';

import { CurveFilterProps } from './types';

export const OtherCurvesFilter: React.FC<CurveFilterProps> = ({
  options,
  onChange,
}) => {
  return (
    <CommonCurveFilter
      title={CurvesFilterType.OTHER}
      options={options}
      onChange={onChange}
    />
  );
};
