import { DataElement, DataElementState, EquipmentData } from 'scarlet/types';

export const getConnectedDataElements = (
  equipment?: EquipmentData,
  dataElementKey?: string,
  ignoreDataElementIds: string[] = []
) => {
  const list: DataElement[] = [];

  if (!equipment || !dataElementKey) return list;
  const equipmentElement = equipment?.equipmentElements
    .filter(
      (dataElement) =>
        dataElement.state !== DataElementState.OMITTED &&
        !ignoreDataElementIds.includes(dataElement.id)
    )
    .find((item) => item.key === dataElementKey);
  if (equipmentElement) list.push(equipmentElement);

  equipment?.components.forEach((component) => {
    const componentElement = component.componentElements
      .filter(
        (dataElement) =>
          dataElement.state !== DataElementState.OMITTED &&
          !ignoreDataElementIds.includes(dataElement.id)
      )
      .find((item) => item.key === dataElementKey);
    if (componentElement) list.push(componentElement);
  });

  return list;
};
