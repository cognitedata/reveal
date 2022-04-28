import {
  DistanceUnitEnum,
  Nds,
  TrueVerticalDepths,
} from '@cognite/sdk-wells-v3';

import { NDSEvent } from 'modules/wellSearch/types';

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

/**
 * This is a deprecated type, updated when sdk refactoring is done
 */
export const mockNdsEvent = (extras?: Partial<NDSEvent>): NDSEvent => ({
  id: 1,
  externalId: 'nds-TTO0000401600-9c3c6ae3-10fd-444b-be7d-ff32123d3fa6',
  type: 'Tool or equipment failure',
  description: 'Equipment failure Tool or equipment failure',
  source: 'test',
  riskType: 'Equipment failure',
  wellboreId: '9c3c6ae3-10fd-444b-be7d-ff32123d3fa6',
  wellName: 'NDS_TEST_WELL',
  wellboreName: 'NDS_TEST_WELLBORE_A',
  lastUpdatedTime: new Date(),
  createdTime: new Date(),
  metadata: {
    name: 'Equipment failure',
    parentExternalId: '9c3c6ae3-10fd-444b-be7d-ff32123d3fa6',
    diameter_hole: '',
    diameter_hole_unit: 'm',
    md_hole_start: '100',
    md_hole_start_unit: 'm',
    md_hole_end: '105',
    md_hole_end_unit: 'm',
    risk_sub_category: 'Tool or equipment failure',
    severity: '',
    probability: '',
    tvd_offset_hole_start: '90',
    tvd_offset_hole_start_unit: 'm',
    tvd_offset_hole_end: '92',
    tvd_offset_hole_end_unit: 'm',
  },
  ...extras,
});

export const mockNdsV2Events = (): NDSEvent[] => [
  mockNdsEvent(),
  mockNdsEvent({
    metadata: {
      ...mockNdsEvent().metadata,
      md_hole_start: '150',
      md_hole_end: '160',
      tvd_offset_hole_start: '120',
      tvd_offset_hole_end: '125',
    },
  }),
  mockNdsEvent({
    metadata: {
      ...mockNdsEvent().metadata,
      md_hole_start: '180',
      md_hole_end: '183',
      tvd_offset_hole_start: '160',
      tvd_offset_hole_end: '165',
    },
  }),
];
