import { CogniteClient, RawDBRowInsert } from '@cognite/sdk';
import { toast } from '@cognite/cogs.js';
import { transformEquipmentToRaw } from 'transformations';
import { EquipmentData, Facility } from 'types';
import config from 'utils/config';

export const saveEquipmentRaw = async (
  client: CogniteClient,
  {
    facility,
    unitId,
    equipmentId,
    equipment,
  }: {
    facility?: Facility;
    unitId: string;
    equipmentId: string;
    equipment: EquipmentData;
  }
) => {
  const dbName = `Scarlet_Output_${config.env}`;
  const tableName = `U1_${facility?.name}_Unit${unitId}`;

  const tableExist = await getExistingTable(client, dbName, tableName);
  if (!tableExist) {
    try {
      await client.raw.createTables(dbName, [{ name: tableName }]);
    } catch (e) {
      console.error(`Failed to create table in RAW. table: ${tableName}`, e);
      toast.error('Failed to create table in RAW');
    }
  }

  const nomralizedData: RawDBRowInsert[] = transformEquipmentToRaw(
    unitId,
    equipmentId,
    equipment
  );

  try {
    await client.raw.insertRows(dbName, tableName, nomralizedData);
  } catch (e) {
    console.error(
      `Failed to insert rows. DB Name: ${dbName}, table: ${tableName}`,
      e
    );
    toast.error('Failed to export data to RAW');
  }
  toast.success('Successfully exported data to RAW');

  // await client.raw.deleteRows(dbName, tableName, [{ key: '' }]);
};

const getExistingTable = async (
  client: CogniteClient,
  dbName: string,
  tableName: string
) => {
  try {
    const tables = await client.raw.listTables(dbName);
    return tables.items.some((table) => table.name === tableName);
  } catch (e) {
    console.error(`Failed to create table in RAW. table: ${tableName}`, e);
    throw Error('Client is not set');
  }
};
