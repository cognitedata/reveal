import { CogniteClient } from '@cognite/sdk';
import { EquipmentElementKey, MALData } from 'scarlet/types';

enum MAL_COLUMNS {
  UNIT_ID = 'Unit',
  EQUIP_ID = 'Equipment ID',
  OPERATING_STATUS = 'SAP Status\n(Active or Inactive)',
}

export const getEquipmentMAL = async (
  client: CogniteClient,
  { unitId, equipmentId }: { unitId: string; equipmentId: string }
): Promise<MALData | undefined> => {
  const tableName = `${unitId}_MAL`;
  const rows = (
    await client.raw.listRows('PCMS', tableName, {
      limit: 1000,
      columns: ['Unit', 'Equipment ID', MAL_COLUMNS.OPERATING_STATUS],
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
  };
};
