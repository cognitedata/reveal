import { createdAndLastUpdatedTime } from '__test-utils/fixtures/log';

import { normalize, normalizeSamples } from '../digitalRocks';

describe('digital rocks utils', () => {
  it('should normalize digital rocks', () => {
    const digitalRocks = [
      {
        id: 1,
        name: 'asset 1',
        rootId: 1123123,
        ...createdAndLastUpdatedTime,
        createdTime: new Date(1396357617000),
        metadata: {
          IMAGE_RESOLUTION: '1.460832',
          PLUG_DEPTH: '23366.45',
          DEPTH_DATUM: 'RKB-MSL',
          SIM_XDIM: '800',
          SIM_YDIM: '1090',
          SIM_ZDIM: '2650',
        },
      },
    ];

    expect(normalize(digitalRocks)).toEqual([
      {
        ...digitalRocks[0],
        metadata: {
          ...digitalRocks[0].metadata,
          dimensionXYZ: '800, 1090, 2650',
          image_resolution: '1.46',
          plugDepthAndDatum: '23366.45 / RKB-MSL',
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
          R_MEDIAN_TRASK: '1.460832',
          R_MEAN_TRASK: '2.460832',
          IMAGE_XDIM: '800',
          IMAGE_YDIM: '1090',
          IMAGE_ZDIM: '2650',
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
          ...digitalRockSamples[0].metadata,
          dimensionXYZ: '800, 1090, 2650',
          rMeanTrask: '2.46',
          rMedianTrask: '1.46',
        },
      },
    ]);
  });
});
