import { CasingSchematic } from '@cognite/sdk-wells-v3';

export const getMockCasings = (): CasingSchematic[] => [
  {
    wellboreAssetExternalId: 'wellbore A',
    wellboreMatchingId: 'wellbore A',
    casingAssemblies: [
      {
        minInsideDiameter: {
          value: 0.033781981757729854,
          unit: 'meter',
        },
        minOutsideDiameter: {
          value: 0.3528058094848629,
          unit: 'meter',
        },
        maxOutsideDiameter: {
          value: 0.5669276938590453,
          unit: 'meter',
        },
        originalMeasuredDepthTop: {
          value: 1565.486277904439,
          unit: 'meter',
        },
        originalMeasuredDepthBase: {
          value: 3150.5894831811365,
          unit: 'meter',
        },
        type: 'DRILLING LINER 3',
      },
    ],
    source: {
      sequenceExternalId: 'sol:casing:050:s:0:0',
      sourceName: 'sol',
    },
    phase: '',
  },
  {
    wellboreAssetExternalId: 'wellbore B',
    wellboreMatchingId: 'wellbore B',
    casingAssemblies: [
      {
        minInsideDiameter: {
          value: 0.05791196872753688,
          unit: 'meter',
        },
        minOutsideDiameter: {
          value: 0.3535678090733831,
          unit: 'meter',
        },
        maxOutsideDiameter: {
          value: 0.5740396900185674,
          unit: 'meter',
        },
        originalMeasuredDepthTop: {
          value: 1871.3865961156291,
          unit: 'meter',
        },
        originalMeasuredDepthBase: {
          value: 4742.230648248619,
          unit: 'meter',
        },
        type: 'DRILLING LINER 1',
      },
      {
        minInsideDiameter: {
          value: 0.03352798189488978,
          unit: 'meter',
        },
        minOutsideDiameter: {
          value: 0.4681217472142565,
          unit: 'meter',
        },
        maxOutsideDiameter: {
          value: 0.6057896728735767,
          unit: 'meter',
        },
        originalMeasuredDepthTop: {
          value: 1865.5679643018252,
          unit: 'meter',
        },
        originalMeasuredDepthBase: {
          value: 5122.444252081784,
          unit: 'meter',
        },
        type: 'INTERMEDIATE CASING 1',
      },
    ],
    source: {
      sequenceExternalId: 'sol:casing:051:s:0:0',
      sourceName: 'sol',
    },
    phase: '',
  },
];
