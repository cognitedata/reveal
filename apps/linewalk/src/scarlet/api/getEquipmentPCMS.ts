import { CogniteClient, Metadata } from '@cognite/sdk';
import { DataSetId } from 'scarlet/types';

import { getUnitAsset } from '.';

export const getEquipmentPCMS = async (
  client: CogniteClient,
  {
    unitName,
    equipmentName,
  }: {
    unitName: string;
    equipmentName: string;
  }
) => {
  let equipment: Metadata | undefined;
  let components: Metadata[] = [];

  const unitAsset = await getUnitAsset(client, { unitName });

  if (!unitAsset) {
    return Promise.resolve({
      equipment,
      components,
    });
  }

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
    equipmentAssetExternalId: equipmentAsset.externalId,
    equipment,
    components,
  };
};
