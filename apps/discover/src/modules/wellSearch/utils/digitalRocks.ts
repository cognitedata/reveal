import get from 'lodash/get';
import round from 'lodash/round';

import { Asset } from '@cognite/sdk';

import {
  DIGITAL_ROCKS_ACCESSORS,
  DIGITAL_ROCK_SAMPLES_ACCESSORS,
} from '../constants';

export const normalize = (digitalRocks: Asset[]) => {
  return digitalRocks.map((row) => ({
    ...row,
    metadata: {
      ...row.metadata,
      dimensionXYZ: `${get(row, DIGITAL_ROCKS_ACCESSORS.DIMENSION_X)}, ${get(
        row,
        DIGITAL_ROCKS_ACCESSORS.DIMENSION_Y
      )}, ${get(row, DIGITAL_ROCKS_ACCESSORS.DIMENSION_Z)}`,
      plugDepthAndDatum: get(row, DIGITAL_ROCKS_ACCESSORS.PLUG_DEPTH)
        ? `${get(row, DIGITAL_ROCKS_ACCESSORS.PLUG_DEPTH)} / ${get(
            row,
            DIGITAL_ROCKS_ACCESSORS.DEPTH_DATUM
          )}`
        : '',
      image_resolution: round(
        get(row, DIGITAL_ROCKS_ACCESSORS.IMAGE_RESOLUTION),
        2
      ).toFixed(2),
    },
  }));
};

export const normalizeSamples = (digitalRocks: Asset[]) => {
  return digitalRocks.map((row) => ({
    ...row,
    metadata: {
      ...row.metadata,
      dimensionXYZ: `${get(
        row,
        DIGITAL_ROCK_SAMPLES_ACCESSORS.DIMENSION_X
      )}, ${get(row, DIGITAL_ROCK_SAMPLES_ACCESSORS.DIMENSION_Y)}, ${get(
        row,
        DIGITAL_ROCK_SAMPLES_ACCESSORS.DIMENSION_Z
      )}`,
      rMedianTrask: get(row, DIGITAL_ROCK_SAMPLES_ACCESSORS.R_MEDIAN_TRASK)
        ? round(
            get(row, DIGITAL_ROCK_SAMPLES_ACCESSORS.R_MEDIAN_TRASK),
            2
          ).toFixed(2)
        : '',
      rMeanTrask: get(row, DIGITAL_ROCK_SAMPLES_ACCESSORS.R_MEAN_TRASK)
        ? round(
            get(row, DIGITAL_ROCK_SAMPLES_ACCESSORS.R_MEAN_TRASK),
            2
          ).toFixed(2)
        : '',
    },
  }));
};
