export enum Condition {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  GREATER_THAN = 'greaterThan',
  GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
  LESS_THAN = 'lessThan',
  LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
}

export type RuleValueType = string | number;

export type RuleResultType = string;

export type RuleType = {
  id: string;
  condition: Condition;
  comparisonValue: RuleValueType;
  then: RuleResultType;
};
