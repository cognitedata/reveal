/* eslint-disable no-param-reassign */
import { v4 as uuid } from 'uuid';
import {
  Formula,
  FormulaType,
  DataElement,
  EquipmentData,
  DetectionType,
  DataElementState,
  DetectionState,
} from 'types';

export const updateCalculatedDataElements = (
  equipment: EquipmentData
): boolean => {
  let isChanged = false;

  // calculate components' data-elements first
  equipment.components.forEach((component) => {
    component.componentElements.forEach((dataElement) => {
      if (dataElement.config.formula) {
        isChanged =
          updateCalculatedDataElement(
            dataElement,
            component.componentElements,
            equipment
          ) || isChanged;
      }
    });
  });

  // calculate equipment data-elements after
  equipment.equipmentElements.forEach((dataElement) => {
    if (dataElement.config.formula) {
      isChanged =
        updateCalculatedDataElement(
          dataElement,
          equipment.equipmentElements,
          equipment
        ) || isChanged;
    }
  });

  return isChanged;
};

const updateCalculatedDataElement = (
  dataElement: DataElement,
  dataElements: DataElement[],
  equipment: EquipmentData
): boolean => {
  const value = resolveFormula(
    dataElement.config.formula!,
    dataElements,
    equipment
  );

  const currentDetection = dataElement.detections.find(
    (d) => d.type === DetectionType.CALCULATED
  );

  if (currentDetection?.value === value) return false;

  if (currentDetection) {
    if (value !== undefined) {
      currentDetection.value = value;
    } else {
      dataElement.detections = dataElement.detections.filter(
        (d) => d.type !== DetectionType.CALCULATED
      );
      dataElement.state = DataElementState.PENDING;
    }
  } else {
    dataElement.detections.push({
      id: uuid(),
      type: DetectionType.CALCULATED,
      value,
      state: DetectionState.APPROVED,
      isPrimary: true,
    });
    dataElement.state = DataElementState.APPROVED;
  }

  return true;
};

const resolveFormula = (
  formula: Formula,
  dataElements: DataElement[],
  equipment: EquipmentData
): string | undefined => {
  switch (formula.type) {
    case FormulaType.REFERENCE:
      return getPrimaryValue(formula.field, dataElements);

    case FormulaType.MAX: {
      const values = equipment.components
        .filter(
          (component) =>
            component.type === formula.component.toLocaleLowerCase()
        )
        .map((component) => {
          const dataElement = component.componentElements.find(
            (dataElement) =>
              dataElement.key === formula.field &&
              dataElement.state === DataElementState.APPROVED
          );
          const value = dataElement?.detections.find((d) => d.isPrimary)?.value;
          return value ? parseFloat(value) : undefined;
        })
        .filter((value) => value !== undefined) as number[];
      return values.length ? Math.max(...values).toString() : undefined;
    }

    case FormulaType.CONSTANT:
      return formula.value;

    case FormulaType.CONDITIONAL: {
      const conditionalFormula = formula.cases.find((conditionalCase) =>
        Object.keys(conditionalCase.condition).every(
          (key) =>
            getPrimaryValue(key, dataElements) ===
            conditionalCase.condition[key]
        )
      )?.return;

      if (conditionalFormula) {
        return resolveFormula(conditionalFormula, dataElements, equipment);
      }
      return undefined;
    }

    case FormulaType.SUM: {
      const args = formula.arguments.map((item) =>
        resolveFormula(item, dataElements, equipment)
      );
      if (args.some((item) => item === undefined)) return undefined;

      return (args as string[])
        .reduce((result, item: string) => result + parseFloat(item), 0)
        .toString();
    }

    case FormulaType.PRODUCT: {
      const args = formula.arguments.map((item) =>
        resolveFormula(item, dataElements, equipment)
      );
      if (args.some((item) => item === undefined)) return undefined;

      return (args as string[])
        .reduce((result, item: string) => result * parseFloat(item), 1)
        .toString();
    }
  }

  return undefined;
};

const getPrimaryValue = (key: string, dataElements: DataElement[]) =>
  dataElements
    .find((element) => element.key === key)
    ?.detections.find((d) => d.isPrimary)?.value;
