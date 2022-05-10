import { CogniteClient } from '@cognite/sdk';
import { DataSetId, Facility } from 'scarlet/types';

import { getUnitAsset } from '.';

export const getEquipmentPCMS = async (
  client: CogniteClient,
  {
    facility,
    unitId,
    equipmentId,
  }: {
    facility?: Facility;
    unitId: string;
    equipmentId: string;
  }
) => {
  if (!facility) throw Error('Facility is not set');

  const unitAsset = await getUnitAsset(client, { facility, unitId });

  if (!unitAsset) {
    throw Error('Unit asset is not available');
  }

  const equipmentAssets = await client.assets.list({
    filter: {
      name: equipmentId,
      externalIdPrefix: 'Equip',
      parentIds: [unitAsset.id],
      dataSetIds: [{ id: DataSetId.PCMS }],
    },
  });

  if (!equipmentAssets.items.length) {
    throw Error('Equipment asset is not available');
  }

  const equipmentAsset = equipmentAssets.items[0];
  const equipment = equipmentAsset;

  const componentAssets = await client.assets.list({
    filter: {
      parentIds: [equipmentAsset.id],
      externalIdPrefix: 'Component',
      dataSetIds: [{ id: DataSetId.PCMS }],
    },
  });

  const components = componentAssets.items;

  return {
    equipmentAssetExternalId: equipmentAsset.externalId,
    equipment,
    components,
  };
};
