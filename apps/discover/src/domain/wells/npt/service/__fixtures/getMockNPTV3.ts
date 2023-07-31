import { Npt } from '@cognite/sdk-wells';

export const getMockNPTV3 = (): Npt => ({
  duration: 0,
  endTime: 0,
  startTime: 0,
  wellboreAssetExternalId: '',
  wellboreMatchingId: '12',
  source: { eventExternalId: '', sourceName: 'Source' },
});
