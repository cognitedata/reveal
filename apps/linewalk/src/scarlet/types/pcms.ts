import { Metadata } from '@cognite/sdk';

export type PCMSData = {
  equipmentAssetExternalId?: string;
  components: Metadata[];
  equipment?: Metadata;
};
