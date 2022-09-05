import { NdsInternalWithTvd } from '../types';

export const getMockNdsInternalEvents = (
  externalId = 'test-nds-wellbore-external-id',
  extras?: Partial<NdsInternalWithTvd>
): NdsInternalWithTvd => {
  return {
    wellboreAssetExternalId: externalId,
    wellboreMatchingId: externalId,
    source: {
      eventExternalId: externalId,
      sourceName: 'test source',
    },
    ndsCodeColor: 'test',
    description: 'Equipment failure Downhole tool',
    holeDiameter: {
      value: 0.445,
      unit: 'm',
    },
    holeStart: {
      value: 2824,
      unit: 'm',
    },
    holeEnd: {
      value: 2863,
      unit: 'm',
    },
    holeTop: {
      value: 2824,
      unit: 'meter',
    },
    holeBase: {
      value: 2863,
      unit: 'meter',
    },
    riskType: 'equipment failure',
    subtype: 'downhole tool',
    severity: undefined,
    probability: undefined,
    holeStartTvd: {
      value: 2823.999,
      unit: 'm',
    },
    holeEndTvd: {
      value: 2862.999,
      unit: 'm',
    },
    ...extras,
  };
};
