import { DataElementState, EquipmentData } from 'types';

export const transformEquipmentToRaw = (
  unitId: string,
  equipmentId: string,
  equipment: EquipmentData
) => {
  const typeName = getComponentTypeName(equipment);
  const equipmentRows = equipment.equipmentElements
    .filter((elem) => elem.state === DataElementState.APPROVED)
    .map((elem) => ({
      key: getRawDataElemKey({
        unitId,
        typeName,
        elemConfigKey: elem.config.key,
      }),
      columns: {
        'Equip ID': equipmentId,
        'Equip Type': typeName,
        'Circuit ID': '-',
        Property: elem.config.label,
        Value: elem.detections.find(
          (detections) => detections.state === 'approved'
        )?.value,
      },
    }));
  const componentRows = equipment.components
    .map((component) => {
      const componentType =
        component.type === 'course'
          ? component.name.toLowerCase()
          : component.type;
      return component.componentElements
        .filter((elem) => elem.state === DataElementState.APPROVED)
        .map((elem) => ({
          key: getRawDataElemKey({
            unitId,
            typeName,
            componentType,
            circuitId: component.circuitId,
            elemConfigKey: elem.config.key,
          }),
          columns: {
            'Equip ID': equipmentId,
            'Circuit ID': component.circuitId,
            'Equip Type': `${typeName} - ${componentType}`,
            Property: elem.config.label,
            Value: elem.detections.find(
              (detections) => detections.state === 'approved'
            )?.value,
          },
        }));
    })
    .flat();

  return [...equipmentRows, ...componentRows];
};

export const getComponentTypeName = (equipment: EquipmentData) =>
  equipment.typeName.replace(/\s/g, '');

export const getRawDataElemKey = ({
  unitId,
  typeName,
  componentType,
  circuitId,
  elemConfigKey,
}: {
  unitId: string;
  typeName: string;
  componentType?: string;
  circuitId?: string;
  elemConfigKey: string;
}) =>
  componentType
    ? `${unitId}_${typeName}_${componentType}_${circuitId}_${elemConfigKey}`
    : `${unitId}_${typeName}_${elemConfigKey}`;
