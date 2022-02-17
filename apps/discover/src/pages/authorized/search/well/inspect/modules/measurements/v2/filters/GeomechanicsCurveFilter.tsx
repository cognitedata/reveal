import React, { useEffect } from 'react';

import { OptionType } from '@cognite/cogs.js';

import { useGeomechanicsFilterOptions } from 'modules/wellSearch/selectors/sequence/measurements/v2/useGeomechanicsFilterOptions';

import { CommonCurveFilter } from './CommonCurveFilter';
import { mapCurvesToOptions } from './utils';

interface Props {
  selectedCurves: string[];
  onChange: (curves: string[]) => void;
}

export const GeomechanicsCurveFilter: React.FC<Props> = ({
  selectedCurves,
  onChange,
}) => {
  const { curves } = useGeomechanicsFilterOptions();

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
      title="Geomechanics curves:"
      options={groupOptions}
      selected={selectedCurves}
      onChange={onChange}
    />
  );
};
