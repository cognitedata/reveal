import { CogniteClient } from '@cognite/sdk';
import { getComponentTypeName, getRawDataElemKey } from 'transformations';
import { DataElement, Detection, EquipmentData, Facility } from 'types';
import config from 'utils/config';

import { getExistingTable } from './saveEquipmentRaw';

export const deleteFieldRaw = async ({
  client,
  detection,
  equipment,
  facility,
  unitId,
  dataElement,
}: {
  client: CogniteClient;
  detection: Detection;
  equipment: EquipmentData;
  facility: Facility;
  unitId: string;
  dataElement: DataElement;
}) => {
  if (detection.state !== 'approved') return;

  let elemToDelete;
  let componentType;
  let circuitId;
  elemToDelete = equipment.equipmentElements.find(
    (elem) => elem.id === dataElement.id
  );
  if (!elemToDelete) {
    equipment.components.map((comp) =>
      comp.componentElements.find((elem) => {
        if (elem.id === dataElement.id) {
          elemToDelete = elem;
          circuitId = comp.circuitId;
          componentType =
            comp.type === 'course' ? comp.name.toLowerCase() : comp.type;
          return true;
        }
        return false;
      })
    );
  }
  if (!elemToDelete) return;

  const typeName = getComponentTypeName(equipment);
  const key = getRawDataElemKey({
    unitId,
    typeName,
    componentType,
    circuitId,
    elemConfigKey: elemToDelete.config.key,
  });

  const dbName = `Scarlet_Output_${config.env}`;
  const tableName = `U1_${facility?.name}_Unit${unitId}`;
  const tableExist = await getExistingTable(client, dbName, tableName);
  if (!tableExist) return;

  await client.raw.deleteRows(dbName, tableName, [{ key }]);
};
