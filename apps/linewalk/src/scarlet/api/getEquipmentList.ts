import { CogniteClient } from '@cognite/sdk';
import {
  DataSetId,
  EquipmentListItem,
  EquipmentStatus,
  Facility,
} from 'scarlet/types';
import { getEquipmentType, getEquipmentTypeLabel } from 'scarlet/utils';
import config from 'utils/config';

import { getUnitAsset } from '.';

export const getEquipmentList = async (
  client: CogniteClient,
  { facility, unitId }: { facility?: Facility; unitId: string }
): Promise<EquipmentListItem[]> => {
  if (!facility) throw Error('Facility is not set');

  let equipments: EquipmentListItem[] = [];
  const equipmentStates = await getEquipmentStates(client, {
    facility,
    unitId,
  });
  const pcmsEquipmentIds = await getPCMSEquipmentIds(client, {
    facility,
    unitId,
  });

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
  { facility, unitId }: { facility: Facility; unitId: string }
) => {
  const equipmentStates: Record<string, any> = {};

  let list = await client.files.list({
    filter: {
      dataSetIds: [{ id: DataSetId.P66_ScarletViewState }],
      metadata: {
        env: config.env,
        facilitySeqNo: facility.sequenceNumber,
        unitId,
      },
    },
    limit: 1000,
  });

  let next;

  do {
    if (next) list = await next(); // eslint-disable-line no-await-in-loop
    list.items.forEach((item) => {
      if (item.metadata?.equipmentId) {
        equipmentStates[item.metadata.equipmentId] = item.metadata;
      }
    });
    next = list.next;
  } while (list.next);

  // await client.files.delete(list.items.map((item) => ({ id: item.id })));

  return equipmentStates;
};

const getPCMSEquipmentIds = async (
  client: CogniteClient,
  { facility, unitId }: { facility: Facility; unitId: string }
) => {
  const equipments: string[] = [];

  try {
    const unitAsset = await getUnitAsset(client, { unitId, facility });
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
    console.error(`Failed to load equipment ids for unit: ${unitId}`, e);
  }

  return equipments;
};
