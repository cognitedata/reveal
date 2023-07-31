import { Asset } from '@cognite/sdk';

export type PCMSData = {
  equipmentAssetExternalId?: string;
  components: Asset[];
  equipment?: Asset;
};
