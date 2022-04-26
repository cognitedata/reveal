import { CogniteClient } from '@cognite/sdk';
import { DataSetId, EquipmentListItem, EquipmentStatus } from 'scarlet/types';
import { getEquipmentType, getEquipmentTypeLabel } from 'scarlet/utils';
import config from 'utils/config';

import { getUnitAsset } from '.';

const isDevelopment = config.env === 'development';

export const getEquipmentList = async (
  client: CogniteClient,
  { unitName }: { unitName: string }
): Promise<EquipmentListItem[]> => {
  let equipments: EquipmentListItem[] = [];
  const equipmentStates = await getEquipmentStates(client, { unitName });
  const pcmsEquipmentIds = await getPCMSEquipmentIds(client, { unitName });

  equipments = pcmsEquipmentIds
    .filter((item) => /^\d+-/.test(item))
    .filter((item, i, self) => self.indexOf(item) === i)
    .map((id) => {
      const equipmentState = equipmentStates[id];
      const completed = equipmentState?.completed === 'Y';
      const progress = equipmentState?.progress ?? 0;
      let status = EquipmentStatus.NOT_STARTED;
      if (completed) status = EquipmentStatus.COMPLETED;
      else if (progress > 0) status = EquipmentStatus.ONGOING;

      return {
        id,
        type: getEquipmentTypeLabel(getEquipmentType(id)),
        status,
        progress,
        modifiedBy: equipmentState?.modifiedBy,
      };
    })
    .sort((a, b) => (a.id < b.id ? -1 : 1));

  return equipments;
};

const getEquipmentStates = async (
  client: CogniteClient,
  { unitName }: { unitName: string }
) => {
  const equipmentStates: Record<string, any> = {};

  const fileParts = [unitName];
  if (isDevelopment) {
    fileParts.unshift('dev');
  }
  const externalIdPrefix = `${fileParts.join('_')}_`;

  let list = await client.files.list({
    filter: {
      externalIdPrefix,
      dataSetIds: [{ id: DataSetId.P66_ScarletViewState }],
    },
    limit: 1000,
  });

  let next;

  do {
    if (next) list = await next(); // eslint-disable-line no-await-in-loop
    list.items.forEach((item) => {
      if (item.metadata?.equipmentName) {
        equipmentStates[item.metadata.equipmentName] = item.metadata;
      }
    });
    next = list.next;
  } while (list.next);

  return equipmentStates;
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
