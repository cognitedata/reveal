import { Asset } from '@cognite/sdk';

export type SearchClassicCadAssetsResponse = {
  nextCursor: string | undefined;
  data: Asset[];
};
