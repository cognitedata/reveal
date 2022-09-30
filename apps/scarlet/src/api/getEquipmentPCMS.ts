import { CogniteClient } from '@cognite/sdk';
import { DataSetId, Facility } from 'types';

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
      parentExternalIds: [`Equipments_${unitAsset.externalId}`],
      dataSetIds: [{ id: DataSetId.P66_PCMS }],
    },
  });

  if (!equipmentAssets.items.length) {
    throw Error('Equipment asset is not available');
  }

  const equipment = equipmentAssets.items[0];

  const componentAssets = await client.assets.list({
    filter: {
      parentExternalIds: [`Circuits_${equipment.externalId}`],
      dataSetIds: [{ id: DataSetId.P66_PCMS }],
      labels: { containsAll: [{ externalId: 'Circuit' }] },
    },
  });

  const components = componentAssets.items;

  return {
    equipmentAssetExternalId: equipment.externalId,
    equipment,
    components,
  };
};
