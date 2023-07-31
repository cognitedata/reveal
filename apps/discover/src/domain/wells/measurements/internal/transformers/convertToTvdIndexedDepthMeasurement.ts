import { getTvdForMd } from 'domain/wells/trajectory/internal/selectors/getTvdForMd';
import { TrueVerticalDepthsDataLayer } from 'domain/wells/trajectory/internal/types';

import compact from 'lodash/compact';
import isUndefined from 'lodash/isUndefined';
import { minMax } from 'utils/number';
import { toDistance } from 'utils/units/toDistance';

import { DepthIndexTypeEnum } from '@cognite/sdk-wells';

import { DepthMeasurementWithData } from '../types';

export const convertToTvdIndexedDepthMeasurement = (
  depthMeasurement: DepthMeasurementWithData,
  wellboreTvdData: TrueVerticalDepthsDataLayer
) => {
  const { depthColumn, rows } = depthMeasurement;

  const { trueVerticalDepths, trueVerticalDepthUnit } = wellboreTvdData;

  const [min, max] = minMax(trueVerticalDepths);
  const unit = toDistance(trueVerticalDepthUnit.unit);

  return {
    ...depthMeasurement,
    depthColumn: {
      ...depthColumn,
      unit,
      type: DepthIndexTypeEnum.TrueVerticalDepth,
    },
    depthRange: {
      min: Math.floor(min),
      max: Math.ceil(max),
      unit,
    },
    rows: compact(
      rows.map(({ depth, ...row }) => {
        const depthTvd = getTvdForMd(depth, wellboreTvdData);

        if (isUndefined(depthTvd)) {
          return null;
        }

        return {
          ...row,
          depth: depthTvd,
        };
      })
    ),
  };
};
