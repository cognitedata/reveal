import { CogniteClient } from '@cognite/sdk';
import { DataSetId, EquipmentListItem } from 'scarlet/types';
import { getEquipmentType, getEquipmentTypeLabel } from 'scarlet/utils';

import { getUnitAsset } from '.';

export const getEquipmentList = async (
  client: CogniteClient,
  { unitName }: { unitName: string }
): Promise<EquipmentListItem[]> => {
  let equipments: EquipmentListItem[] = [];
  const equipmentIds = await getEquipmentIds(client, { unitName });
  const pcmsEquipmentIds = await getPCMSEquipmentIds(client, { unitName });

  equipments = [...equipmentIds, ...pcmsEquipmentIds]
    .filter((item) => /^\d+-/.test(item))
    .filter((item, i, self) => self.indexOf(item) === i)
    .map((id) => ({
      id,
      type: getEquipmentTypeLabel(getEquipmentType(id)),
    }))
    .sort((a, b) => (a.id < b.id ? -1 : 1));

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

const getPCMSEquipmentIds = async (
  client: CogniteClient,
  { unitName }: { unitName: string }
) => {
  const equipments: string[] = [];

  try {
    const unitAsset = await getUnitAsset(client, { unitName });
    if (!unitAsset) return equipments;

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
      equipments.push(...list.items.map((item) => item.name));
      next = list.next;
    } while (list.next);
  } catch (e) {
    // not critical data to fetch
    console.error(`Failed to load equipment ids for unit: ${unitName}`, e);
  }

  return equipments;
};
