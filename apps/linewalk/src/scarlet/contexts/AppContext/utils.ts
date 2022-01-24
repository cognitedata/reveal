import {
  DataElement,
  DataElementOrigin,
  DataElementState,
  EquipmentData,
} from 'scarlet/types';

const deepCopy = (obj: any) => JSON.parse(JSON.stringify(obj));

export const updateDataElementState = (
  equipmentOrigin: EquipmentData,
  dataElement: DataElement,
  state: DataElementState,
  stateReason?: string
): EquipmentData => {
  const equipment: EquipmentData = deepCopy(equipmentOrigin);
  if (dataElement.origin === DataElementOrigin.EQUIPMENT) {
    const index = equipment.equipmentElements.findIndex(
      (item) => item.key === dataElement.key
    );
    equipment.equipmentElements[index] = {
      ...dataElement,
      state,
      stateReason,
    };
  }
  return equipment;
};
