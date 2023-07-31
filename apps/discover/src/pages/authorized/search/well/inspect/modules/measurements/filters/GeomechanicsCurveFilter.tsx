import { DepthMeasurementDataColumnInternal } from 'domain/wells/measurements/internal/types';

import * as React from 'react';

import { OptionType } from '@cognite/cogs.js';

import { useDeepEffect } from 'hooks/useDeep';
import { useGeomechanicsFilterOptions } from 'pages/authorized/search/well/inspect/modules/measurements/hooks/useGeomechanicsFilterOptions';

import { CommonCurveFilter } from './CommonCurveFilter';
import { mapCurvesToOptions } from './utils';

interface Props {
  selectedCurves: DepthMeasurementDataColumnInternal[];
  onChange: (curves: DepthMeasurementDataColumnInternal[]) => void;
}

export const GeomechanicsCurveFilter: React.FC<Props> = ({
  selectedCurves,
  onChange,
}) => {
  const { curves } = useGeomechanicsFilterOptions();

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
      title="Geomechanics curves:"
      options={groupOptions}
      selected={selectedCurves}
      onChange={onChange}
      grouped
    />
  );
};
