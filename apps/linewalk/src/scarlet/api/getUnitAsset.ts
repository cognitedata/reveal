import { CogniteClient } from '@cognite/sdk';

export const getUnitAsset = async (
  client: CogniteClient,
  { unitName }: { unitName: string }
) => {
  const unitAsset = await client.assets
    .list({
      filter: {
        name: unitName,
        externalIdPrefix: 'Unit',
      },
    })
    .then((result) =>
      result.items.find(
        (item) => !item.externalId?.toLocaleLowerCase().includes('test')
      )
    );

  return unitAsset;
};
