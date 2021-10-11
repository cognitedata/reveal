import get from 'lodash/get';
import round from 'lodash/round';

import { Asset } from '@cognite/sdk';

import { shortDateTime } from '_helpers/date';
import { WellConfig } from 'tenants/types';

export const normalize = (digitalRocks: Asset[], config?: WellConfig) => {
  return digitalRocks.map((row) => ({
    ...row,
    metadata: {
      ...row.metadata,
      created_date: shortDateTime(
        get(row, 'metadata.created_date'),
        config?.digitalRocks?.metaInfo?.createdTmeFormat
      ),
      dimensionXYZ: `${get(row, 'metadata.xdim')}, ${get(
        row,
        'metadata.ydim'
      )}, ${get(row, 'metadata.zdim')}`,
      plugDepthAndDatum: `${get(row, 'metadata.plug_depth')} / ${get(
        row,
        'metadata.plug_depth_datum'
      )}`,
      image_resolution: round(get(row, 'metadata.image_resolution'), 2).toFixed(
        2
      ),
    },
  }));
};

export const normalizeSamples = (digitalRocks: Asset[]) => {
  return digitalRocks.map((row) => ({
    ...row,
    metadata: {
      ...row.metadata,
      dimensionXYZ: `${get(row, 'metadata.xdim')}, ${get(
        row,
        'metadata.ydim'
      )}, ${get(row, 'metadata.zdim')}`,
      r_median_trask: round(get(row, 'metadata.r_median_trask'), 2).toFixed(2),
      r_mean_trask: round(get(row, 'metadata.r_mean_trask'), 2).toFixed(2),
    },
  }));
};
