import { DataElementState, EquipmentData } from 'types';

export const transformEquipmentToRaw = (
  unitId: string,
  equipmentId: string,
  equipment: EquipmentData
) => {
  const typeName = equipment.typeName.replace(/\s/g, '');
  const equipmentRows = equipment.equipmentElements
    .filter((elem) => elem.state === DataElementState.APPROVED)
    .map((elem) => ({
      key: `${unitId}_${typeName}_${elem.config.key}`,
      columns: {
        'Equip ID': equipmentId,
        'Equip Type': typeName,
        Property: elem.config.label,
        Value: elem.detections.find(
          (detections) => detections.state === 'approved'
        )?.value,
      },
    }));
  const componentRows = equipment.components
    .map((component) =>
      component.componentElements
        .filter((elem) => elem.state === DataElementState.APPROVED)
        .map((elem) => ({
          key: `${unitId}_${typeName}_${component.type}_${elem.config.key}`,
          columns: {
            'Equip ID': equipmentId,
            'Equip Type': `${typeName} - ${component.type}`,
            Property: elem.config.label,
            Value: elem.detections.find(
              (detections) => detections.state === 'approved'
            )?.value,
          },
        }))
    )
    .flat();

  return [...equipmentRows, ...componentRows];
};
