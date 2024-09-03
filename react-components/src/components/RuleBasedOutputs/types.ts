/*!
 * Copyright 2024 Cognite AS
 */

import { type TreeIndexNodeCollection, type NumericRange } from '@cognite/reveal';
import { type FdmNode, type EdgeItem, type DmsUniqueIdentifier } from '../../data-providers/FdmSDK';
import {
  type FdmAssetStylingGroup,
  type AssetStylingGroup,
  type FdmPropertyType
} from '../Reveal3DResources/types';
import { type Datapoints, type Asset, type Timeseries, type Node3D } from '@cognite/sdk';
import { type FdmCadConnection } from '../CacheProvider/types';

// =========== RULE BASED OUTPUT DATA MODEL

export type TriggerType = 'timeseries' | 'metadata' | 'fdm';

export type TimeseriesRuleTrigger = {
  type: 'timeseries';
  externalId: string;
};

export type MetadataRuleTrigger = {
  type: 'metadata';
  key: string;
};

export type FdmRuleTrigger = {
  type: 'fdm';
  key: FdmInstanceNodeDataKey;
};

export type FdmInstanceNodeDataKey = {
  space: string;
  externalId: string;
  view: Source;
  typing: FdmKeyRuleTriggerTyping;
  property: string;
};

export type StringTrigger = MetadataRuleTrigger;

export type BooleanCondition = {
  type: 'equals' | 'notEquals';
  parameter: boolean;
};

export type StringCondition = {
  type: 'equals' | 'notEquals' | 'contains' | 'startsWith' | 'endsWith';
  parameter: string;
};

export type DatetimeCondition =
  | {
      type:
        | 'before'
        | 'notBefore'
        | 'onOrBefore'
        | 'after'
        | 'notAfter'
        | 'onOrAfter'
        | 'on'
        | 'notOn';
      parameter: string;
    }
  | {
      type: 'between';
      lowerBound: string;
      upperBound: string;
    }
  | {
      type: 'notBetween';
      lowerBound: string;
      upperBound: string;
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
  trigger: StringTrigger | FdmRuleTrigger;
  condition: StringCondition;
};

export type NumericExpression = {
  type: 'numericExpression';
  trigger: MetadataRuleTrigger | TimeseriesRuleTrigger | FdmRuleTrigger;
  condition: NumericCondition;
};

export type DatetimeExpression = {
  type: 'datetimeExpression';
  trigger: FdmRuleTrigger;
  condition: DatetimeCondition;
};

export type BooleanExpression = {
  type: 'booleanExpression';
  trigger: FdmRuleTrigger;
  condition: BooleanCondition;
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

export type ConcreteExpression =
  | StringExpression
  | NumericExpression
  | DatetimeExpression
  | BooleanExpression;

export type Expression = ConcreteExpression | ExpressionOperator;

export type Rule = {
  type: 'rule';
  id: string; // uuid
  name: string;
  expression: Expression | undefined;
};

export type BaseRuleOutput = {
  externalId: string; // comes from FDM
  label?: string;
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

export type ExpressionOperatorsTypes = 'and' | 'or' | 'not';

export type BooleanConditionTypes = 'equals' | 'notEquals';

export type StringConditionTypes = 'equals' | 'notEquals' | 'contains' | 'startsWith' | 'endsWith';

export type NumericConditionTypes =
  | 'equals'
  | 'notEquals'
  | 'lessThan'
  | 'greaterThan'
  | 'lessThanOrEquals'
  | 'greaterThanOrEquals'
  | 'within'
  | 'outside';

export type NumericUniqueConditionTypes =
  | 'equals'
  | 'notEquals'
  | 'lessThan'
  | 'greaterThan'
  | 'lessThanOrEquals'
  | 'greaterThanOrEquals';

export type NumericWithinConditionType = {
  type: 'within';
  lowerBoundInclusive: number;
  upperBoundInclusive: number;
};

export type NumericOutsideConditionType = {
  type: 'outside';
  lowerBoundExclusive: number;
  upperBoundExclusive: number;
};

export type DatetimeConditionTypes = 'between' | 'notBetween' | DatetimeUniqueConditionTypes;

export type DatetimeUniqueConditionTypes =
  | 'before'
  | 'notBefore'
  | 'onOrBefore'
  | 'after'
  | 'notAfter'
  | 'onOrAfter'
  | 'on'
  | 'notOn';

export type DatetimeBetweenConditionType = {
  type: 'between' | 'notBetween';
  lowerBound: string;
  upperBound: string;
};

export type CriteriaTypes =
  | BooleanConditionTypes
  | string
  | number
  | NumericWithinConditionType
  | NumericOutsideConditionType
  | DatetimeBetweenConditionType;

export type RuleAndStyleIndex = {
  styleIndex: TreeIndexNodeCollection;
  ruleOutputParams: RuleOutput;
};

export type AssetStylingGroupAndStyleIndex = {
  styleIndex: TreeIndexNodeCollection;
  assetStylingGroup: AssetStylingGroup;
};

export type FdmStylingGroupAndStyleIndex = {
  styleIndex: TreeIndexNodeCollection;
  fdmStylingGroup: FdmAssetStylingGroup;
};

export type AllRuleBasedStylingGroups = {
  assetStylingGroup: AssetStylingGroup[];
  fdmStylingGroup: FdmAssetStylingGroup[];
};

export type AllMappingStylingGroupAndStyleIndex = {
  assetMappingsStylingGroupAndIndex: AssetStylingGroupAndStyleIndex;
  fdmStylingGroupAndStyleIndex: FdmStylingGroupAndStyleIndex;
};

export type NodeAndRange = {
  treeIndex: number;
  nodeId: number;
  subtreeRange: NumericRange;
  assetId: number;
};

export type RuleAndEnabled = {
  isEnabled: boolean;
  rule: FdmNode<RuleOutputSet>;
};

export type RuleRecord = EdgeItem<Record<string, any>> | NodeItem<Record<string, any>>;

export type InstanceType = 'node' | 'edge';

export type Source = {
  type: 'view';
} & SimpleSource;

export type SimpleSource = {
  version: string;
} & DmsUniqueIdentifier;

export type ViewQueryFilter = {
  view: Source;
};

export type Space = string;

export type NodeItem<PropertyType = Record<string, unknown>> = {
  instanceType: InstanceType;
  version: number;
  space: string;
  externalId: string;
  createdTime: number;
  lastUpdatedTime: number;
  deletedTime?: number;
  properties: FdmPropertyType<PropertyType>;
};

export type EmptyRuleForSelection = {
  rule: {
    properties: EmptyRuleForSelectionProps;
  };
  isEnabled: boolean;
};

export type EmptyRuleForSelectionProps = {
  id: string | undefined;
  name: string;
  isNoSelection: boolean;
};

export type TriggerTypeData = TriggerMetadataType | TriggerTimeseriesType | TriggerFdmType;

export type TriggerMetadataType = {
  type: 'metadata';
  asset: Asset;
};

export type TriggerTimeseriesType = {
  type: 'timeseries';
  timeseries: {
    timeseriesWithDatapoints: TimeseriesAndDatapoints[];
    linkedAssets: Asset;
  };
};

export type TriggerFdmType = {
  type: 'fdm';
  instanceNode: FdmInstanceNodeWithConnectionAndProperties;
};

export type TimeseriesAndDatapoints = Timeseries & Datapoints;

export type FdmKeyRuleTriggerTyping = Record<
  string,
  Record<
    string,
    Record<
      string,
      {
        name: string;
        typing: FdmRuleTriggerTyping;
      }
    >
  >
>;

export type FdmRuleTriggerTyping = {
  nullable?: boolean;
  autoIncrement?: boolean;
  defaultValue?: any;
  description?: string;
  name?: string;
  immutable?: boolean;
  container?: {
    type?: string;
    space?: string;
    externalId?: string;
  };
  containerPropertyIdentifier?: string;
  type: {
    collation?: string;
    list?: boolean;
    type: string;
  };
};

export type FdmInstanceWithProperties = NodeItem<unknown> | EdgeItem<unknown>;

export type FdmInstanceWithPropertiesAndTyping = {
  items: FdmInstanceWithProperties[];
  typing: FdmTyping;
};

export type FdmTyping = Record<
  string,
  Record<
    string,
    Record<
      string,
      {
        nullable?: boolean;
        autoIncrement?: boolean;
        defaultValue?: any;
        description?: string;
        name?: string;
        immutable?: boolean;
        type: { collation?: string; list?: boolean; type: string };
      }
    >
  >
>;

export type FdmInstanceNodeWithConnectionAndProperties = {
  instanceType: 'node';
  version: number;
  space: string;
  externalId: string;
  createdTime: number;
  lastUpdatedTime: number;
  deletedTime: number;
  items: FdmInstanceWithProperties[];
  connection?: FdmCadConnection | undefined;
  cadNode?: Node3D | undefined;
  view?: Source | undefined;
  typing: FdmTyping;
};
