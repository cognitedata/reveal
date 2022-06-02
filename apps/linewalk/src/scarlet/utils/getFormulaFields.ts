import { getEquipmentComponentType } from 'scarlet/transformations';
import {
  EquipmentComponentType,
  Formula,
  FormulaField,
  FormulaType,
} from 'scarlet/types';

export const getFormulaFields = (
  formula?: Formula,
  componentType?: EquipmentComponentType
): FormulaField[] => {
  if (!formula) return [];

  switch (formula.type) {
    case FormulaType.REFERENCE:
      return [{ field: formula.field, componentType }];
    case FormulaType.MAX:
      return [
        {
          field: formula.field,
          componentType: getEquipmentComponentType(formula.component),
        },
      ];
    case FormulaType.SUM:
    case FormulaType.PRODUCT:
      return formula.arguments.flatMap((item) =>
        getFormulaFields(item, componentType)
      );
    case FormulaType.CONDITIONAL:
      return formula.cases.flatMap((item) => [
        ...Object.keys(item.condition).map((field) => ({
          field,
          componentType,
        })),
        ...getFormulaFields(item.return, componentType),
      ]);
  }

  return [];
};
