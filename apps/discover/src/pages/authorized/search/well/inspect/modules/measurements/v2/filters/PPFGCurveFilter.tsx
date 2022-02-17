import React, { useEffect } from 'react';

import { OptionType } from '@cognite/cogs.js';

import { usePPFGFilterOptions } from 'modules/wellSearch/selectors/sequence/measurements/v2/usePPFGFilterOptions';

import { CommonCurveFilter } from './CommonCurveFilter';
import { mapCurvesToOptions } from './utils';

interface Props {
  selectedCurves: string[];
  onChange: (curves: string[]) => void;
}

export const PPFGCurveFilter: React.FC<Props> = ({
  selectedCurves,
  onChange,
}) => {
  const { curves } = usePPFGFilterOptions();

  const groupOptions: OptionType<string>[] = [
    {
      label: 'Curves',
      options: mapCurvesToOptions(curves),
    },
  ];

  useEffect(() => {
    onChange(curves);
  }, [JSON.stringify(curves)]);

  return (
    <CommonCurveFilter
      title="PPFG curves:"
      options={groupOptions}
      selected={selectedCurves}
      onChange={onChange}
    />
  );
};
