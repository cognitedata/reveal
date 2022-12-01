import { CogniteClient, ListResponse, FileInfo } from '@cognite/sdk';
import { EquipmentListItem, EquipmentStatus, Facility } from 'types';
import { getEquipmentType, isValidEquipment } from 'utils';
import config from 'utils/config';
import { getDocuments } from 'api';
import { datasetByProject } from 'config';

import { getUnitAsset } from '.';

const getU1Presence = ({
  identifier,
  docs,
}: {
  identifier: string;
  docs: ListResponse<FileInfo[]>;
}) =>
  docs.items.some((doc) => doc.name.startsWith(identifier)) ? 'Yes' : 'No';

export const getEquipmentList = async (
  client: CogniteClient,
  { facility, unitId }: { facility?: Facility; unitId: string }
): Promise<EquipmentListItem[]> => {
  if (!facility) throw Error('Facility is not set');
  if (!unitId) throw Error('UnitId is not set');

  let equipmentList: EquipmentListItem[] = [];
  const equipmentStates = await getEquipmentStates(client, {
    facility,
    unitId,
  });
  const pcmsEquipmentList = await getPCMSEquipmentList(client, {
    facility,
    unitId,
  });
  const docs = await getDocuments(client, {
    facility,
    unitId,
  });

  equipmentList = pcmsEquipmentList
    .filter(isValidEquipment)
    .map((eq) => {
      const equipmentState = equipmentStates[eq.id];
      const progress = equipmentState?.progress ?? 0;
      const completed = equipmentState?.progress === '100';
      let status = EquipmentStatus.NOT_STARTED;
      if (completed) status = EquipmentStatus.COMPLETED;
      else if (equipmentState?.modifiedBy) status = EquipmentStatus.ONGOING;
      const type = getEquipmentType(eq.type);
      const u1doc = getU1Presence({
        identifier: `${facility.name}_${unitId}_${eq.id}`,
        docs,
      });

      return {
        id: eq.id,
        type,
        typeName: eq.type,
        status,
        progress,
        modifiedBy: equipmentState?.modifiedBy,
        u1doc,
      };
    })
    .sort((a, b) => (a.id < b.id ? -1 : 1));

  return equipmentList;
};

const getEquipmentStates = async (
  client: CogniteClient,
  { facility, unitId }: { facility: Facility; unitId: string }
) => {
  const dataSet = datasetByProject(client.project);
  const equipmentStates: Record<string, any> = {};

  let list = await client.files.list({
    filter: {
      dataSetIds: [{ id: dataSet.P66_ScarletEquipmentState }],
      metadata: {
        env: config.env,
        facilityId: facility.id,
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

const getPCMSEquipmentList = async (
  client: CogniteClient,
  { facility, unitId }: { facility: Facility; unitId: string }
): Promise<{ id: string; type: string }[]> => {
  const equipmentList: { id: string; type: string }[] = [];

  try {
    const unitAsset = await getUnitAsset(client, { unitId, facility });
    if (!unitAsset) return equipmentList;

    let list = await client.assets.list({
      filter: {
        dataSetIds: [{ id: facility.datasetId }],
        parentExternalIds: [`Equipments_${unitAsset.externalId}`],
        labels: { containsAll: [{ externalId: 'Equipment' }] },
      },
      limit: 1000,
    });

    let next;

    do {
      if (next) list = await next(); // eslint-disable-line no-await-in-loop
      equipmentList.push(
        ...list.items.map((item) => ({
          id: item.name,
          type: item.metadata?._typeName ?? '', // eslint-disable-line no-underscore-dangle
        }))
      );
      next = list.next;
    } while (list.next);
  } catch (e) {
    // not critical data to fetch
    console.error(`Failed to load equipment ids for unit: ${unitId}`, e);
  }

  return equipmentList;
};
