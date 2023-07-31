import {
  ComponentElementKey,
  DataElement,
  DataElementOrigin,
  DataElementState,
  EquipmentData,
  EquipmentElementKey,
} from 'types';

export const getConnectedDataElements = (
  equipment?: EquipmentData,
  dataElement?: DataElement,
  ignoreDataElementIds: string[] = []
) => {
  const list: DataElement[] = [];

  if (!equipment || !dataElement) return list;

  const connectedKeys = getConnectedKeys(dataElement.key);
  if (dataElement?.origin === DataElementOrigin.EQUIPMENT) {
    // add connected equipment elements
    list.push(
      ...getConnectedElements(equipment.equipmentElements, connectedKeys)
    );

    // add connected component elements
    equipment?.components.forEach((component) => {
      list.push(
        ...getConnectedElements(component.componentElements, connectedKeys)
      );
    });
  } else {
    if (dataElement.key === ComponentElementKey.COMPONENT_ID) return [];
    const refComp = equipment?.components.find(
      ({ id }) => dataElement.componentId === id
    );
    let parentCompType = '';
    const currCompType = refComp!.type;

    // the subcomponent course id is suffixed with its parent component type - using that we can filter subcomponents per parent component type
    // eslint-disable-next-line prefer-destructuring
    if (currCompType === 'course') parentCompType = refComp!.id.split('-')[0];

    // add connected component elements only from the same group/type
    equipment?.components
      .filter((component) => {
        if (parentCompType) {
          return (
            component.type === currCompType &&
            component.id.startsWith(parentCompType)
          );
        }
        return component.type === currCompType;
      })
      .forEach((component) => {
        list.push(
          ...getConnectedElements(component.componentElements, connectedKeys)
        );
      });
  }

  return list.filter(({ id }) => !ignoreDataElementIds.includes(id));
};

const CONNECTED_DATA_ELEMENT_KEYS = [
  [EquipmentElementKey.INSTALL_DT, ComponentElementKey.INSTALL_DATE],
] as string[][];

const getConnectedKeys = (key: string) => {
  return (
    CONNECTED_DATA_ELEMENT_KEYS.find((keys) => keys.includes(key)) || [key]
  );
};

const getConnectedElements = (
  dataElements: DataElement[] = [],
  keys: string[] = []
) =>
  keys.reduce((result, key) => {
    const foundElement = dataElements
      .filter((dataElement) => dataElement.state !== DataElementState.OMITTED)
      .find((item) => item.key === key);
    if (foundElement) result.push(foundElement);
    return result;
  }, [] as DataElement[]);
