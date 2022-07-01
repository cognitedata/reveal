import { usePPFGFilterOptions } from 'domain/wells/measurements0/internal/hooks/usePPFGFilterOptions';

import React from 'react';

import { OptionType } from '@cognite/cogs.js';
import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import { useDeepEffect } from 'hooks/useDeep';

import { CommonCurveFilter } from './CommonCurveFilter';
import { mapCurvesToOptions } from './utils';

interface Props {
  selectedCurves: DepthMeasurementColumn[];
  onChange: (curves: DepthMeasurementColumn[]) => void;
}

export const PPFGCurveFilter: React.FC<Props> = ({
  selectedCurves,
  onChange,
}) => {
  const { curves } = usePPFGFilterOptions();

  const groupOptions: OptionType<DepthMeasurementColumn>[] = [
    {
      label: 'Curves',
      options: mapCurvesToOptions(curves),
    },
  ];

  useDeepEffect(() => {
    onChange(curves);
  }, [curves]);

  return (
    <CommonCurveFilter
      title="PPFG curves:"
      options={groupOptions}
      selected={selectedCurves}
      onChange={onChange}
      grouped
    />
  );
};
