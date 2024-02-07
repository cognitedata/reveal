/*!
 * Copyright 2023 Cognite AS
 */
import { useEffect, type ReactElement, useMemo } from 'react';

import {
  type IdEither,
  type AssetMapping3D,
  type AssetMappings3DListFilter,
  type CogniteClient,
  Asset
} from '@cognite/sdk';
import {
  type AddModelOptions,
  type CogniteCadModel,
  TreeIndexNodeCollection
} from '@cognite/reveal';
import { useSDK } from '../RevealContainer/SDKProvider';
import { useReveal } from '../..';
import { Color } from 'three';
import { FdmSDK } from '../../utilities/FdmSDK';
import { RULE_BASED_COLORING_SOURCE } from '../../utilities/globalDataModels';
import {
  type RuleOutput,
  type Rule,
  type RuleOutputSet,
  type NumericExpression,
  type StringExpression,
  MetadataRuleTrigger,
  type StringCondition,
  type StringTrigger,
  type Expression,
  ColorRuleOutput
} from 'rule-based-actions/src/lib/types';
import { NodeAndRange } from './types';

export type ColorOverlayProps = {
  addModelOptions: AddModelOptions;
  ruleSet: RuleOutputSet;
  rules: Rule[];
};

export function ColorOverlayRules({
  addModelOptions,
  ruleSet,
  rules
}: ColorOverlayProps): ReactElement {
  const cdfClient = useSDK();
  const fdmSdk = useMemo(() => new FdmSDK(cdfClient), [cdfClient]);

  const viewer = useReveal();
  console.log(' RULESET', ruleSet);
  console.log(' RULES', rules);
  console.log(' SDK', cdfClient);

  const { modelId, revisionId } = addModelOptions;

  const operatorSymbolsMap = new Map<string, string>();
  operatorSymbolsMap.set('equals', '==');
  operatorSymbolsMap.set('notEquals', '!=');
  operatorSymbolsMap.set('lessThan', '<');
  operatorSymbolsMap.set('greaterThan', '>');
  operatorSymbolsMap.set('lessThanOrEquals', '<=');
  operatorSymbolsMap.set('greaterThanOrEquals', '>=');

  operatorSymbolsMap.set('contains', '.contains($<parameter>)');
  operatorSymbolsMap.set('startsWith', '.startsWith($<parameter>)');
  operatorSymbolsMap.set('endsWith', '.endsWith($<parameter>)');

  operatorSymbolsMap.set('endsWith', '.endsWith($<parameter>)');

  operatorSymbolsMap.set(
    'within',
    '>=$<lowerBoundInclusive> && asset.$<trigger.type>[$<trigger.key>]<=$<upperBoundInclusive>'
  );
  operatorSymbolsMap.set(
    'outside',
    '<$<lowerBoundExclusive> || asset.$<trigger.type>[$<trigger.key>]>$<upperBoundExclusive>'
  );

  const baseOperatorsMap = new Map<string, string>();

  baseOperatorsMap.set('or', ' || ');
  baseOperatorsMap.set('and', ' && ');
  baseOperatorsMap.set('not', ' ! ');

  useEffect(() => {
    const checkStringExpressionStatement = (
      asset: Asset,
      expression: StringExpression
    ): boolean => {
      const { trigger, condition } = expression;
      const operatorDeclaration = operatorSymbolsMap.get(condition.type);
      if (operatorDeclaration === undefined || asset === undefined) return false;

      let expressionResult: boolean = false;

      switch (condition.type) {
        case 'equals': {
          expressionResult = asset[trigger.type]?.[trigger.key] === condition.parameter;
          break;
        }
        case 'notEquals': {
          expressionResult = asset[trigger.type]?.[trigger.key] !== condition.parameter;
          break;
        }
        case 'contains': {
          expressionResult =
            asset[trigger.type]?.[trigger.key].includes(condition.parameter) ?? false;
          break;
        }
        case 'startsWith': {
          expressionResult =
            asset[trigger.type]?.[trigger.key].startsWith(condition.parameter) ?? false;
          break;
        }
        case 'endsWith': {
          expressionResult =
            asset[trigger.type]?.[trigger.key].endsWith(condition.parameter) ?? false;
          break;
        }
      }

      return expressionResult;
    };
    const checkNumericExpressionStatement = (
      asset: Asset,
      expression: NumericExpression
    ): boolean => {
      return true;
    };

    const traverseExpression = (
      asset: Asset,
      expressions: Expression[],
      levelExpressionOperator: string
    ): boolean[] => {
      let expressionResult: boolean = false;

      console.log(' =========== ');
      console.log(' expressions: ', expressions);
      console.log(' levelExpressionOperator: ', levelExpressionOperator);

      const expressionResults: boolean[] = [];

      expressions.forEach((expression) => {
        switch (expression.type) {
          case 'or': {
            const operatorResult = traverseExpression(
              asset,
              expression.expressions,
              expression.type
            );
            expressionResult = operatorResult.find((result) => result) ?? false;
            /*  innerStatementString = '(' + currentStatement + ')'; */
            break;
          }
          case 'and': {
            const operatorResult = traverseExpression(
              asset,
              expression.expressions,
              expression.type
            );
            expressionResult = operatorResult.find((result) => !result) ?? false;

            /*  innerStatementString = '(' + currentStatement + ')'; */
            break;
          }
          case 'not': {
            const operatorResult = traverseExpression(
              asset,
              [expression.expression],
              expression.type
            );
            expressionResult = !operatorResult[0]; // TODO: make the not operator
            break;
          }
          case 'numericExpression': {
            expressionResult = checkNumericExpressionStatement(asset, expression);
            break;
          }
          case 'stringExpression': {
            expressionResult = checkStringExpressionStatement(asset, expression);
            break;
          }
          default: {
            // statements;
            break;
          }
        }
        expressionResults.push(expressionResult);
      });

      return expressionResults;
    };

    const getContextualization = async (): Promise<void> => {
      const ruleModel = await fdmSdk.getByExternalIds(
        [
          {
            instanceType: 'node',
            externalId: 'Rule_based_Coloring_Json',
            space: 'rule_based_coloring_space'
          }
        ],
        RULE_BASED_COLORING_SOURCE
      );

      console.log(' RULE MODEL ', ruleModel);

      // const models = sdk.models;
      const assetMappings = await getCdfCadContextualization({
        sdk: cdfClient,
        modelId,
        revisionId,
        nodeId: undefined,
        assetId: undefined
      });

      // const contextualizedThreeDNodeIds = assetMappings.map((node) => node.nodeId);

      // remove duplicated
      const uniqueContextualizedAssetIds = [...new Set(assetMappings.map((node) => node.assetId))];

      const contextualizedAssetIds = uniqueContextualizedAssetIds.map((id) => {
        return { id };
      }) as unknown as IdEither[];

      const contextualizedAssetNodes = await cdfClient.assets.retrieve(contextualizedAssetIds);

      const model = viewer.models[0] as CogniteCadModel;
      console.log(' model ', model);

      const outputType = 'color';

      type RuleAndStyleIndex = {
        styleIndex: TreeIndexNodeCollection;
        ruleOutputParams: RuleOutput;
      };

      const ruleWithOutputs = ruleSet.rulesWithOutputs;

      ruleWithOutputs.forEach((ruleWithOutput) => {
        const { rule, outputs } = ruleWithOutput;
        // Starting Expression
        const expression = rule.expression;

        const outputSelected = outputs.find(
          (output) => output.type === outputType
        ) as ColorRuleOutput;

        const ruleOutputAndStyleIndex: RuleAndStyleIndex = {
          styleIndex: new TreeIndexNodeCollection(),
          ruleOutputParams: outputSelected
        };

        if (outputSelected === undefined) {
          console.log('No rule output found for the type requested: ', outputType, outputs);
          return;
        }

        contextualizedAssetNodes.map(async (assetNode) => {
          const finalGlobalOutputResult = traverseExpression(
            assetNode,
            [expression],
            expression.type
          );

          if (finalGlobalOutputResult[0]) {
            const nodesFromThisAsset = assetMappings.filter(
              (mapping) => mapping.assetId === assetNode.id
            );

            // get the 3d nodes linked to the asset and with treeindex and subtreeRange
            const treeNodes: NodeAndRange[] = await Promise.all(
              nodesFromThisAsset.map(async (nodeFromAsset) => {
                const subtreeRange = await model.getSubtreeTreeIndices(nodeFromAsset.treeIndex);
                const node: NodeAndRange = {
                  nodeId: nodeFromAsset.nodeId,
                  treeIndex: nodeFromAsset.treeIndex,
                  subtreeRange
                };
                return node;
              })
            );
            const nodeIndexSet = ruleOutputAndStyleIndex.styleIndex.getIndexSet();
            treeNodes.forEach((node) => {
              nodeIndexSet.addRange(node.subtreeRange);
            });

            // assign the style with the color from the condition
            model.assignStyledNodeCollection(ruleOutputAndStyleIndex.styleIndex, {
              color: new Color(outputSelected.fill)
            });
          }

          console.log(' ASSET ', assetNode, finalGlobalOutputResult);
        });
      });
    };
    void getContextualization();
  }, []);

  return <></>;
}

const createFilter = ({
  nodeId,
  assetId
}: {
  nodeId: number | undefined;
  assetId: number | undefined;
}): AssetMappings3DListFilter => {
  return {
    nodeId,
    assetId
  };
};

const getCdfCadContextualization = async ({
  sdk,
  modelId,
  revisionId,
  nodeId,
  assetId
}: {
  sdk: CogniteClient;
  modelId: number;
  revisionId: number;
  nodeId: number | undefined;
  assetId: number | undefined;
}): Promise<AssetMapping3D[]> => {
  const filter = createFilter({ nodeId, assetId });

  return await sdk.assetMappings3D
    .list(modelId, revisionId, filter)
    .autoPagingToArray({ limit: Infinity });
};
