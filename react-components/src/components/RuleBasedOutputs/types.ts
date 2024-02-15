/*!
 * Copyright 2023 Cognite AS
 */

import { type NumericRange } from '@cognite/reveal';

export type NodeAndRange = {
  treeIndex: number;
  nodeId: number;
  subtreeRange: NumericRange;
};

// =========== RULE BASED OUTPUT DATA MODEL

export type TimeseriesRuleTrigger = {
  type: 'timeseries';
  timeseriesId: number;
};

export type MetadataRuleTrigger = {
  type: 'metadata';
  key: string;
};

export type StringTrigger = MetadataRuleTrigger;

export type StringCondition = {
  type: 'equals' | 'notEquals' | 'contains' | 'startsWith' | 'endsWith';
  parameter: string;
};

export type NumericCondition =
  | {
      type:
        | 'equals'
        | 'notEquals'
        | 'lessThan'
        | 'greaterThan'
        | 'lessThanOrEquals'
        | 'greaterThanOrEquals';
      parameters: number[];
    }
  | {
      type: 'within';
      lowerBoundInclusive: number;
      upperBoundInclusive: number;
    }
  | {
      type: 'outside';
      lowerBoundExclusive: number;
      upperBoundExclusive: number;
    };

export type StringExpression = {
  type: 'stringExpression';
  trigger: StringTrigger;
  condition: StringCondition;
};

export type NumericExpression = {
  type: 'numericExpression';
  trigger: MetadataRuleTrigger | TimeseriesRuleTrigger;
  condition: NumericCondition;
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

export type ConcreteExpression = StringExpression | NumericExpression;

export type Expression = ConcreteExpression | ExpressionOperator;

export type Rule = {
  id: string; // uuid
  name: string;
  expression: Expression;
};

export type BaseRuleOutput = {
  externalId: string; // comes from FDM
  // ruleId: string | undefined; // Transiently it can be left undefined
};

export type ColorRuleOutput = BaseRuleOutput & {
  type: 'color';
  fill: string; // Transparent by default
  outline: string; // Transparent by default
};

export type CanvasRuleOutput = BaseRuleOutput & {
  type: 'canvasAnnotation';
  fill: string; // Transparent by default
  outline: string; // Transparent by default
  canvasAnnotationId: string;
};

export type EmailRuleOutput = BaseRuleOutput & {
  type: 'email';
  email: string;
};

export type NotificationRuleOutput = BaseRuleOutput & {
  type: 'notification';
  notification: string;
};

export type RuleOutput =
  | CanvasRuleOutput
  | ColorRuleOutput
  | EmailRuleOutput
  | NotificationRuleOutput;

export type RuleWithOutputs = {
  rule: Rule;
  outputs: RuleOutput[];
};

export type RuleOutputSet = {
  id: string; // (?)
  name: string;
  createdAt: number;
  createdBy: string;
  rulesWithOutputs: RuleWithOutputs[];
  // isEnabled: boolean; // The applications can be disabled on a per-rule basis, can be stored in the application storage, not part of rule set?
};

// FDM Datamodel
export type FdmRuleOutputSet = {
  id: string; // (?)
  name: string;
  createdAt: number;
  createdBy: string;
  rulesWithOutputs: RuleWithOutputs[]; // JSON Blob 40kb each
  // This is a hack to make it easier to query for the types of outputs in FDM.
  // Will be kept in sync by the implementation / the shared JS lib.
  // Might not be needed if DMS allows us to filter on the output types
  shamefulOutputTypes: Array<'color' | 'canvasAnnotation'>;
  // isEnabled: boolean; // The applications can be disabled on a per-rule basis, can be stored in the application storage, not part of rule set?
};

// =====================================

// ======== GENERAL TYPES ==============

export type InstanceType = 'node' | 'edge';

export type Source = {
  type: 'view';
} & SimpleSource;

export type SimpleSource = {
  version: string;
} & DmsUniqueIdentifier;

export type DmsUniqueIdentifier = {
  space: Space;
  externalId: ExternalId;
};

export type ViewQueryFilter = {
  view: Source;
};

export type ExternalId = string;
export type Space = string;

export type ExternalIdsResultList<PropertyType> = {
  items: Array<NodeItem<PropertyType>>;
  typing?: Record<
    string,
    Record<
      string,
      Record<
        string,
        {
          nullable?: boolean;
          autoIncrement?: boolean;
          defaultValue?: unknown;
          description?: string;
          name?: string;
          type: { type: string };
        }
      >
    >
  >;
};

export type NodeItem<PropertyType = Record<string, unknown>> = {
  instanceType: InstanceType;
  version: number;
  space: string;
  externalId: string;
  createdTime: number;
  lastUpdatedTime: number;
  deletedTime: number;
  properties: FdmPropertyType<PropertyType>;
};

export type FdmPropertyType<NodeType> = Record<string, Record<string, NodeType>>;
