import { CogniteClient } from '@cognite/sdk';

export const getUnitAsset = async (
  client: CogniteClient,
  { unitName }: { unitName: string }
) => {
  const unitAssets = await client.assets.list({
    filter: {
      name: unitName,
      externalIdPrefix: 'Unit',
    },
  });

  return unitAssets.items.length ? unitAssets.items[0] : undefined;
};
