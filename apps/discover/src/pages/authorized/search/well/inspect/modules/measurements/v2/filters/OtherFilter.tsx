import React, { useEffect } from 'react';

import { useOtherFilterOptions } from 'modules/wellSearch/selectors/sequence/measurements/v2/useOtherFilterOptions';

import { CommonCurveFilter } from './CommonCurveFilter';
import { mapCurvesToOptions } from './utils';

interface Props {
  selectedCurves: string[];
  onChange: (curves: string[]) => void;
}

export const OtherFilter: React.FC<Props> = ({ selectedCurves, onChange }) => {
  const { types } = useOtherFilterOptions();

  useEffect(() => {
    onChange(types);
  }, [JSON.stringify(types)]);

  return (
    <CommonCurveFilter
      title="Other data:"
      options={mapCurvesToOptions(types)}
      selected={selectedCurves}
      onChange={onChange}
    />
  );
};
