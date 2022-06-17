import { Npt } from '@cognite/sdk-wells-v3';

export const getMockGroupedNpt = (extras?: Partial<Npt[]>) => ({
  CEMT: [
    {
      wellboreAssetExternalId: 'wb-01',
    },
    {
      wellboreAssetExternalId: 'wb-02',
    },
    {
      wellboreAssetExternalId: 'wb-03',
    },
    {
      wellboreAssetExternalId: 'wb-04',
    },
    {
      wellboreAssetExternalId: 'wb-05',
    },
  ],
  RREP: [
    {
      wellboreAssetExternalId: 'wb-06',
    },
    {
      wellboreAssetExternalId: 'wb-07',
    },
    {
      wellboreAssetExternalId: 'wb-08',
    },
  ],
  DFAL: [
    {
      wellboreAssetExternalId: 'wb-09',
    },
    {
      wellboreAssetExternalId: 'wb-10',
    },
    {
      wellboreAssetExternalId: 'wb-11',
    },
    {
      wellboreAssetExternalId: 'wb-12',
    },
    {
      wellboreAssetExternalId: 'wb-13',
    },
    {
      wellboreAssetExternalId: 'wb-14',
    },
    {
      wellboreAssetExternalId: 'wb-15',
    },
    {
      wellboreAssetExternalId: 'wb-16',
    },
    {
      wellboreAssetExternalId: 'wb-17',
    },
  ],
  ...extras,
});
