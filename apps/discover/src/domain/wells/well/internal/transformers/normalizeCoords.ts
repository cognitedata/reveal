import { WellInternal } from 'domain/wells/well/internal/types';

import proj4 from 'proj4';
import { log } from 'utils/log';

import { proj4Defs } from 'modules/map/proj4Defs';

proj4.defs(Object.keys(proj4Defs).map((key) => [key, proj4Defs[key]]));

export const normalizeCoords = ({
  x = 0,
  y = 0,
  crs = '',
}: {
  x?: string | number;
  y?: string | number;
  crs?: string;
}): Partial<WellInternal> => {
  if (!crs) {
    return {};
  }

  const CRS = crs.toUpperCase();

  if (CRS === 'EPSG:4326') {
    return {
      geometry: {
        type: 'Point',
        coordinates: [Number(x), Number(y)],
      },
    };
  }

  if (proj4Defs[CRS]) {
    try {
      const [normalizedX, normalizedY] = proj4(crs.toUpperCase()).inverse([
        Number(x),
        Number(y),
      ]);
      if (normalizedX && normalizedY) {
        return {
          geometry: {
            type: 'Point',
            coordinates: [normalizedX, normalizedY],
          },
        };
      }
    } catch (error) {
      log('Error during tranforming coordinates', String(error));
    }
  } else {
    log('proj4 Defs Not found :', crs);
  }

  return {};
};
