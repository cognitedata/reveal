import { DepthMeasurementDataColumnInternal } from 'domain/wells/measurements/internal/types';

import * as React from 'react';

import { OptionType } from '@cognite/cogs.js';

import { useDeepEffect } from 'hooks/useDeep';

import { usePPFGFilterOptions } from '../hooks/usePPFGFilterOptions';

import { CommonCurveFilter } from './CommonCurveFilter';
import { mapCurvesToOptions } from './utils';

interface Props {
  selectedCurves: DepthMeasurementDataColumnInternal[];
  onChange: (curves: DepthMeasurementDataColumnInternal[]) => void;
}

export const PPFGCurveFilter: React.FC<Props> = ({
  selectedCurves,
  onChange,
}) => {
  const { curves } = usePPFGFilterOptions();

  const groupOptions: OptionType<DepthMeasurementDataColumnInternal>[] = [
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
