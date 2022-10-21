import { CogniteClient } from '@cognite/sdk';
import { DataSetId, Facility } from 'types';

import { getUnitAsset, getEquipmentAsset } from '.';

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

  const equipment = await getEquipmentAsset(client, {
    facility,
    unitId,
    equipmentId,
  });

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
