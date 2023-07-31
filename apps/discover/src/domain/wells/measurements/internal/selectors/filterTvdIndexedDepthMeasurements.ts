import { DepthIndexTypeEnum } from '@cognite/sdk-wells';

import { DepthMeasurementWithData } from '../types';

export const filterTvdIndexedDepthMeasurements = (
  data: DepthMeasurementWithData[]
) => {
  return data.filter(
    ({ depthColumn }) =>
      depthColumn.type === DepthIndexTypeEnum.TrueVerticalDepth
  );
};
