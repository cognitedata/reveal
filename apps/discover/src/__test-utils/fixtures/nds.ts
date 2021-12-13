import {
  DistanceUnitEnum,
  Nds,
  TrueVerticalDepths,
} from '@cognite/sdk-wells-v3';

export const getMockNdsEvent = (extras?: Partial<Nds>): Nds => ({
  wellboreAssetExternalId: 'events/nds/test/wellboreAssetExternalId',
  wellboreMatchingId: 'events/nds/test/wellboreMatchingId',
  source: {
    eventExternalId: 'events/nds/test/eventExternalId',
    sourceName: 'TEST_SOURCE',
  },
  holeStart: {
    value: 75.0,
    unit: 'meter',
  },
  holeEnd: {
    value: 85.0,
    unit: 'meter',
  },
  severity: 5,
  probability: 4,
  description: 'Test description',
  holeDiameter: {
    value: 3.0,
    unit: 'meter',
  },
  riskType: 'TEST_RISKTYPE',
  ...extras,
});

export const mockNdsEvents: Nds[] = [
  getMockNdsEvent({
    wellboreAssetExternalId: 'wellboreAssetExternalId-1',
    wellboreMatchingId: 'wellboreMatchingId-1',
  }),
  getMockNdsEvent({
    wellboreAssetExternalId: 'wellboreAssetExternalId-2',
    wellboreMatchingId: 'wellboreMatchingId-2',
  }),
];

export const mockTrueVerticalDepths: TrueVerticalDepths = {
  trueVerticalDepths: [35, 50],
  measuredDepths: [75, 85],
  trueVerticalDepthUnit: { unit: DistanceUnitEnum.Meter },
  sequenceSource: {
    sequenceExternalId: 'events/nds/test/TrueVerticalDepths/sequenceExternalId',
    sourceName: 'TEST_SOURCE',
  },
  wellboreAssetExternalId: 'events/nds/test/wellboreAssetExternalId',
  wellboreMatchingId: 'events/nds/test/wellboreMatchingId',
};
