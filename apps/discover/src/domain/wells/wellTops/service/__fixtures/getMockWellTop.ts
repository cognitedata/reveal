import { WellTops } from '@cognite/sdk-wells';

export const getMockWellTop = (extras?: Partial<WellTops>): WellTops => {
  return {
    wellboreMatchingId: 'test-well-1',
    wellboreName: 'test-well-1',
    source: {
      sequenceExternalId: 'test-formation-top-1',
      sourceName: 'test-source',
    },
    measuredDepthUnit: 'meter',
    trueVerticalDepthUnit: 'meter',
    tops: [
      {
        name: 'T98 - Top Stronsay',
        top: {
          measuredDepth: 546.08,
          trueVerticalDepth: 546.0508955300851,
        },
        base: {
          measuredDepth: 855,
          trueVerticalDepth: 854.9137049586135,
        },
      },
      {
        name: 'T84 - Intra Stronsay Gp1',
        top: {
          measuredDepth: 855,
          trueVerticalDepth: 854.9137049586135,
        },
        base: {
          measuredDepth: 974.08,
          trueVerticalDepth: 973.9730549849618,
        },
      },
    ],
    ...extras,
  };
};
