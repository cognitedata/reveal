import { CogniteClient } from '@cognite/sdk';
import { DataSetId, EquipmentListItem } from 'scarlet/types';

import { getUnitAsset } from '.';

export const getEquipmentList = async (
  client: CogniteClient,
  { unitName }: { unitName: string }
): Promise<EquipmentListItem[]> => {
  let equipments: EquipmentListItem[] = [];
  const equipmentIds = await getEquipmentIds(client, { unitName });
  const equipmentGroups = await getEquipmentGroups(client, { unitName });

  equipments = equipmentIds.map((id) => ({
    id,
    group: equipmentGroups[id],
  }));

  return equipments;
};

const getEquipmentIds = async (
  client: CogniteClient,
  { unitName }: { unitName: string }
) => {
  let equipmentIds: string[] = [];

  let list = await client.files.list({
    filter: {
      externalIdPrefix: `${unitName}_`,
      dataSetIds: [{ id: DataSetId.P66_ScarletScannerResults }],
    },
    limit: 1000,
  });

  let next;

  do {
    if (next) list = await next(); // eslint-disable-line no-await-in-loop
    equipmentIds = equipmentIds.concat(
      list.items.map((item) => item.name.split('_')[1])
    );
    next = list.next;
  } while (list.next);

  return equipmentIds.filter((id, i, list) => list.indexOf(id) === i).sort();
};

const getEquipmentGroups = async (
  client: CogniteClient,
  { unitName }: { unitName: string }
) => {
  const equipmentGroups: Record<string, string | undefined> = {};

  try {
    const unitAsset = await getUnitAsset(client, { unitName });
    if (!unitAsset) return equipmentGroups;

    let list = await client.assets.list({
      filter: {
        externalIdPrefix: 'Equip',
        parentIds: [unitAsset.id],
        dataSetIds: [{ id: DataSetId.PCMS }],
      },
      limit: 1000,
    });

    let next;

    do {
      if (next) list = await next(); // eslint-disable-line no-await-in-loop
      list.items.forEach((item) => {
        equipmentGroups[item.name] = item.metadata?.equip_group;
      });
      next = list.next;
    } while (list.next);
  } catch (e) {
    // not critical data to fetch
    console.error(`Failed to load equipment groups for unit: ${unitName}`, e);
  }

  return equipmentGroups;
};
