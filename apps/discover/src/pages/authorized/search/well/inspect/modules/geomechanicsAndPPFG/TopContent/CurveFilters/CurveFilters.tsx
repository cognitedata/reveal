import React, { useState } from 'react';

import difference from 'lodash/difference';
import flatten from 'lodash/flatten';
import { BooleanMap, toBooleanMap } from 'utils/booleanMap';

import { useDeepCallback, useDeepEffect } from 'hooks/useDeep';

import { CurvesFilterType } from '../../types';

import { GeomechanicsCurvesFilter } from './GeomechanicsCurvesFilter';
import { OtherCurvesFilter } from './OtherCurvesFilter';
import { PpfgCurvesFilter } from './PpfgCurvesFilter';

export interface CurveFiltersProps {
  options: Record<CurvesFilterType, string[]>;
  onChange: (curveSelection: BooleanMap) => void;
}

export const CurveFilters: React.FC<CurveFiltersProps> = ({
  options,
  onChange,
}) => {
  const [curveSelection, setCurveSelection] = useState<BooleanMap>({});

  useDeepEffect(() => {
    const curves = flatten(Object.values(options));
    const curveSelection = toBooleanMap(curves, true);
    setCurveSelection(curveSelection);
  }, [options]);

  useDeepEffect(() => {
    onChange(curveSelection);
  }, [curveSelection]);

  const handleChangeFilter = useDeepCallback(
    (filterType: CurvesFilterType, selectedOptions: string[]) => {
      const allOptions = options[filterType];
      const deselectedOptions = difference(allOptions, selectedOptions);

      setCurveSelection((curveSelection) => ({
        ...curveSelection,
        ...toBooleanMap(selectedOptions, true),
        ...toBooleanMap(deselectedOptions, false),
      }));
    },
    [options]
  );

  return (
    <>
      <div data-testid="geo-curves-filter">
        <GeomechanicsCurvesFilter
          options={options[CurvesFilterType.GEOMECHANNICS]}
          onChange={(selectedOptions) =>
            handleChangeFilter(CurvesFilterType.GEOMECHANNICS, selectedOptions)
          }
        />
      </div>
      <div data-testid="ppfg-curves-filter">
        <PpfgCurvesFilter
          options={options[CurvesFilterType.PPFG]}
          onChange={(selectedOptions) =>
            handleChangeFilter(CurvesFilterType.PPFG, selectedOptions)
          }
        />
      </div>

      <div data-testid="other-curves-filter">
        <OtherCurvesFilter
          options={options[CurvesFilterType.OTHER]}
          onChange={(selectedOptions) =>
            handleChangeFilter(CurvesFilterType.OTHER, selectedOptions)
          }
        />
      </div>
    </>
  );
};
