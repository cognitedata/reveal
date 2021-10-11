import { createdAndLastUpdatedTime } from '__test-utils/fixtures/log';
import { WellConfig } from 'tenants/types';

import { normalize, normalizeSamples } from '../digitalRocks';

describe('digital rocks utils', () => {
  it('should normalize digital rocks', () => {
    const digitalRocks = [
      {
        id: 1,
        name: 'asset 1',
        rootId: 1123123,
        ...createdAndLastUpdatedTime,
        metadata: {
          created_date: '20200218_225825',
          image_resolution: '1.460832',
          plug_depth: '23366.45',
          plug_depth_datum: 'RKB-MSL',
          xdim: '800',
          ydim: '1090',
          zdim: '2650',
        },
      },
    ];
    const config: WellConfig = {
      digitalRocks: {
        metaInfo: { createdTmeFormat: 'YYYYMMDD_HHmmss' },
        enabled: true,
      },
    };
    expect(normalize(digitalRocks, config)).toEqual([
      {
        id: 1,
        name: 'asset 1',
        rootId: 1123123,
        ...createdAndLastUpdatedTime,
        metadata: {
          created_date: '18.Feb.20 10:58:25',
          dimensionXYZ: '800, 1090, 2650',
          image_resolution: '1.46',
          plugDepthAndDatum: '23366.45 / RKB-MSL',
          plug_depth: '23366.45',
          plug_depth_datum: 'RKB-MSL',
          xdim: '800',
          ydim: '1090',
          zdim: '2650',
        },
      },
    ]);
  });

  it('should normalize digital rocks samples', () => {
    const digitalRockSamples = [
      {
        id: 1,
        name: 'asset 1',
        rootId: 1123123,
        ...createdAndLastUpdatedTime,
        metadata: {
          r_median_trask: '1.460832',
          r_mean_trask: '2.460832',
          xdim: '800',
          ydim: '1090',
          zdim: '2650',
        },
      },
    ];
    expect(normalizeSamples(digitalRockSamples)).toEqual([
      {
        id: 1,
        name: 'asset 1',
        rootId: 1123123,
        ...createdAndLastUpdatedTime,
        metadata: {
          dimensionXYZ: '800, 1090, 2650',
          r_mean_trask: '2.46',
          r_median_trask: '1.46',
          xdim: '800',
          ydim: '1090',
          zdim: '2650',
        },
      },
    ]);
  });
});
