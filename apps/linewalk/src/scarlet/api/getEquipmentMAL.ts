import { CogniteClient } from '@cognite/sdk';
import {
  ComponentElementKey,
  EquipmentElementKey,
  Facility,
  MALData,
} from 'scarlet/types';

enum MAL_COLUMNS {
  UNIT_ID = 'Unit',
  EQUIP_ID = 'Equipment ID',
  OPERATING_STATUS = 'SAP Status\n(Active or Inactive)',
  SYS_GOVERN_CODE = 'Design Code',
}

export const getEquipmentMAL = async (
  client: CogniteClient,
  {
    facility,
    unitId,
    equipmentId,
  }: { facility: Facility; unitId: string; equipmentId: string }
): Promise<MALData | undefined> => {
  if (!facility) throw Error('Facility is not set');
  if (!unitId) throw Error('Unit id is not set');
  if (!equipmentId) throw Error('Equipment id is not set');

  const tableName = `${facility.sequenceNumber}_${unitId}_MAL`;
  const rows = (
    await client.raw.listRows('PCMS', tableName, {
      columns: [
        MAL_COLUMNS.UNIT_ID,
        MAL_COLUMNS.EQUIP_ID,
        MAL_COLUMNS.OPERATING_STATUS,
        MAL_COLUMNS.SYS_GOVERN_CODE,
      ],
      limit: 1000,
    })
  ).items;

  const equipmentRow = rows.find(
    (row) =>
      row.columns[MAL_COLUMNS.UNIT_ID] === unitId &&
      row.columns[MAL_COLUMNS.EQUIP_ID] === equipmentId
  );

  return {
    [EquipmentElementKey.OPERATING_STATUS]: equipmentRow?.columns[
      MAL_COLUMNS.OPERATING_STATUS
    ] as string,
    [ComponentElementKey.SYS_GOVERN_CODE]: equipmentRow?.columns[
      MAL_COLUMNS.SYS_GOVERN_CODE
    ] as string,
  };
};
