import { CogniteClient } from '@cognite/sdk';
import { Facility } from 'types';

import { getUnitAsset } from '.';

export const getEquipmentAsset = async (
  client: CogniteClient,
  {
    facility,
    unitId,
    equipmentId,
  }: {
    facility: Facility;
    unitId: string;
    equipmentId: string;
  }
) => {
  const unitAsset = await getUnitAsset(client, { facility, unitId });

  if (!unitAsset) {
    throw Error('Unit asset is not available');
  }

  const equipmentAssets = await client.assets.list({
    filter: {
      name: equipmentId,
      parentExternalIds: [`Equipments_${unitAsset.externalId}`],
      dataSetIds: [{ id: facility.datasetId }],
    },
  });

  if (!equipmentAssets.items.length) {
    throw Error('Equipment asset is not available');
  }

  const equipment = equipmentAssets.items[0];

  return equipment;
};
