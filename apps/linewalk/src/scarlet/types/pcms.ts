import { Metadata } from '@cognite/sdk';

export type PCMSData = {
  components: Metadata[];
  equipment?: Metadata;
};
