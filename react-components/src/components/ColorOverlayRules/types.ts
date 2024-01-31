/*!
 * Copyright 2023 Cognite AS
 */

import { NumericRange } from '@cognite/reveal';

export type RuleSet = {
  rules: BaseRuleApplication[];
  // isEnabled: boolean; // The applications can be disabled on a per-rule basis, can be stored in the application storage, not part of rule set?
  name: string;
  id: string; // (?)
};

export type ThreeDRuleApplication = {
  applicationId: 'threeDApplication';
};

export type CanvasRuleApplication = {
  applicationId: 'canvasApplication';
  canvasAnnotationId: string;
};

export type CommonRuleApplicationFields = {
  fill: string; // Transparent by default
  outline: string; // Transparent by default
  rule: Rule | undefined; // Transiently it can be left undefined
};

export type BaseRuleApplication = (ThreeDRuleApplication | CanvasRuleApplication) &
  CommonRuleApplicationFields;

export type Rule = {
  id: string; // uuid
  name: string;
  expression: Expression;
};

export type Expression = ConcreteExpression | ExpressionOperator;

export type ConcreteExpression = StringExpression | NumericExpression;

export type StringExpression = {
  type: 'stringExpression';
  trigger: MetadataRuleTrigger;
  condition: StringCondition;
};

export type StringCondition = {
  type: 'equals' | 'notEquals' | 'contains' | 'startsWith' | 'endsWith' ;
  parameter: string[];
};

export type NumericExpression = {
  type: 'numericExpression';
  trigger: MetadataRuleTrigger | TimeseriesRuleTrigger;
  condition: NumericCondition;
};

export type NumericCondition = {
  type: 'equals' | 'notEquals' | 'lessThan' | 'greaterThan' | 'within' | 'outside';
  parameters: number[];
};

export type ExpressionOperator =
  | {
      type: 'or';
      expressions: Expression[];
    }
  | {
      type: 'and';
      expressions: Expression[];
    }
  | {
      type: 'not';
      expression: Expression;
    };

export type TimeseriesRuleTrigger = {
  type: 'timeseries';
  timeseriesId: number;
  timeseriesExternalId: string;
};

export type MetadataRuleTrigger = {
  type: 'metadata';
  key: string;
};


/**
 * Multiple rule applications can point to a single rule.
 * In canvas, the rule application is for instance coloring a shape red
 */

export type NodeAndRange = {
  treeIndex: number;
  nodeId: number;
  subtreeRange: NumericRange;
};
