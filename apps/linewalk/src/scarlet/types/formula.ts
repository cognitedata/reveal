import { EquipmentComponentType } from './equipmentComponent';

export type Formula =
  | { type: FormulaType.REFERENCE; field: string }
  | { type: FormulaType.CONSTANT; value: string }
  | {
      type: FormulaType.MAX;
      component: string;
      field: string;
    }
  | {
      type: FormulaType.SUM | FormulaType.PRODUCT;
      arguments: Formula[];
    }
  | {
      type: FormulaType.CONDITIONAL;
      cases: FormulaConditionalCase[];
    };

export type FormulaConditionalCase = {
  condition: {
    [field: string]: string;
  };
  return: Formula;
};

export enum FormulaType {
  CONSTANT = 'constant',
  REFERENCE = 'reference',
  PRODUCT = 'product',
  SUM = 'sum',
  MAX = 'max',
  CONDITIONAL = 'conditional',
}

export type FormulaField = {
  field: string;
  componentType?: EquipmentComponentType;
};
