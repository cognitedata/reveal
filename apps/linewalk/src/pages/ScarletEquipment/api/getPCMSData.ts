import { CogniteClient, Metadata } from '@cognite/sdk';

import { DataSetId } from '../types';

export const getPCMSData = async (
  client: CogniteClient,
  unitName: string,
  equipmentName: string
) => {
  let equipment: Metadata | undefined;
  let components: Metadata[] = [];

  const unitAssets = await client.assets.list({
    filter: {
      name: unitName,
      externalIdPrefix: 'Unit',
    },
  });

  if (!unitAssets.items.length) {
    return Promise.resolve({
      equipment,
      components,
    });
  }

  const unitAsset = unitAssets.items[0];

  const equipmentAssets = await client.assets.list({
    filter: {
      name: equipmentName,
      externalIdPrefix: 'Equip',
      parentIds: [unitAsset.id],
      dataSetIds: [{ id: DataSetId.PCMS }],
    },
  });

  if (!equipmentAssets.items.length) {
    return Promise.resolve({
      equipment,
      components,
    });
  }

  const equipmentAsset = equipmentAssets.items[0];
  equipment = equipmentAsset.metadata;

  const componentAssets = await client.assets.list({
    filter: {
      parentIds: [equipmentAsset.id],
      externalIdPrefix: 'Component',
      dataSetIds: [{ id: DataSetId.PCMS }],
    },
  });

  components = componentAssets.items
    .map((item) => item.metadata)
    .filter((item) => item) as Metadata[];

  return {
    equipment,
    components,
  };
};
