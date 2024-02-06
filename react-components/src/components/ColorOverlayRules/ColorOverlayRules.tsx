/*!
 * Copyright 2023 Cognite AS
 */
import { useEffect, type ReactElement, useMemo } from 'react';

import {
  type IdEither,
  type AssetMapping3D,
  type AssetMappings3DListFilter,
  type CogniteClient
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
import { RuleOutput, type Rule, type RuleOutputSet, NumericExpression, StringExpression, MetadataRuleTrigger, StringCondition, StringTrigger } from 'rule-based-actions/src/lib/types';

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

  const operatorSymbolsMap = new Map<string,string>();
  operatorSymbolsMap.set("equals","==");
  operatorSymbolsMap.set("notEquals","!=");
  operatorSymbolsMap.set("lessThan","<");
  operatorSymbolsMap.set("greaterThan",">");
  operatorSymbolsMap.set("lessThanOrEquals","<=");
  operatorSymbolsMap.set("greaterThanOrEquals",">=");

  operatorSymbolsMap.set("contains",".contains(${{parameter}})");
  operatorSymbolsMap.set("startsWith",".startsWith(${{parameter}})");
  operatorSymbolsMap.set("endsWith",".endsWith(${{parameter}})");

  operatorSymbolsMap.set("endsWith",".endsWith(${{parameter}})");

  operatorSymbolsMap.set("within",">=${{lowerBoundInclusive}} && ${{asset}}.${{trigger.type}}[${{trigger.key}}]<=${{upperBoundInclusive}}");
  operatorSymbolsMap.set("outside","<${{lowerBoundExclusive}} || ${{asset}}.${{trigger.type}}[${{trigger.key}}]>${{upperBoundExclusive}}");

  useEffect(() => {
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

      const outputType = "color";

      type RuleAndStyleIndex = {
        rule: Rule;
        styleIndex: TreeIndexNodeCollection;
        ruleOutputParams: RuleOutput;
      }

      const ruleWithOutputs = ruleSet.rulesWithOutputs;

      ruleWithOutputs.forEach((ruleWithOutput) => {

        const { rule, outputs } = ruleWithOutput;
        // Starting Expression
        const expression = rule.expression;
        let ruleGlobalStatement: string = "";
        let initialOperator: string = "";
        let initialExpression: string = "";

        const outputSelected = outputs.find((output) => output.type === outputType);

        if (!outputSelected) {
          console.log('No rule output found for the type requested: ', outputType, outputs);
          return;
        }


        const replaceDeclarationsWithValuesForStrings = (declaration: string, triggerData: StringTrigger, conditionData: StringCondition): string => {
          declaration?.replace('${{parameter}}',conditionData.parameter);
          declaration?.replace('${{trigger.type}}',triggerData.type);
          declaration?.replace('${{trigger.key}}',triggerData.key);

          return declaration;
        }

        const generateStringExpressionStatement = (expression: StringExpression): string => {
          const { trigger, condition } = expression;
          const operatorDeclaration = operatorSymbolsMap.get(condition.type);
          if (!operatorDeclaration) return "";

          const filledDeclaration = replaceDeclarationsWithValuesForStrings(operatorDeclaration, trigger, condition);

          const stringExpression = "${{asset}}."+trigger.type+"['"+trigger.key+"']"+filledDeclaration+"'"+condition.parameter+"'";

          return stringExpression;
        }
        const generateNumericExpressionStatement = (expression: NumericExpression): string => {
          return "";
        }

      switch(expression.type) {
        case 'or': {
            initialOperator = " || ";
            break;
        }
        case 'and': {
          initialOperator = " && ";
            break;
        }
        case 'not': {
          initialOperator = " ! ";
          break;
        }
        case 'numericExpression': {
          initialExpression = generateNumericExpressionStatement(expression);
          break;
        }
        case 'stringExpression': {
          initialExpression = generateStringExpressionStatement(expression);
          break;
        }
        default: {
            //statements;
            break;
        }
      }
       ruleGlobalStatement = ruleGlobalStatement + initialExpression + initialOperator;


       /* ruleOutputs.forEach((ruleOutput) => {
          const ruleContent = rules.find((rule) => rule.id === ruleOutput.ruleId);
          if (ruleContent !== undefined) {
            const ruleContentAndStyleIndex: RuleAndStyleIndex = {
              rule: ruleContent,
              styleIndex: new TreeIndexNodeCollection(),
              ruleOutputParams: ruleOutput,
            };
            generateRuleAndOutputFromContent(ruleContentAndStyleIndex);
          }
        });
      }); */

      /* const generateRuleAndOutputFromContent = (ruleContentAndStyleIndex: RuleAndStyleIndex) => {

        ruleContentAndStyleIndex.
      } */

      // go through all the rules
      /* rules.forEach((rule) => {
        const conditions = rule.conditions;
        const isStringRule = rule.isStringRule as boolean;

        // insert the node styles for each condition only once
        conditions.forEach((condition: { nodeIdsStyleIndex: TreeIndexNodeCollection }) => {
          condition.nodeIdsStyleIndex = new TreeIndexNodeCollection();
        });

        // if the type is metadata
        if (rule.rulerTriggerType === 'metadata') {
          // go through all the contextualized assets
          contextualizedAssetNodes.forEach((asset) => {
            // if it is more than one metadata field name
            rule.sourceField.forEach((sourceField: any) => {
              // get the field value from the asset
              const metadataFieldValue = asset.metadata?.[sourceField];

              // if the asset has the metadata with that specific field and a value,
              // then go through all rule conditions
              if (metadataFieldValue !== undefined) {
                conditions.forEach(
                  async (condition: {
                    nodeIdsStyleIndex: TreeIndexNodeCollection;
                    valueString: any;
                    color: string;
                  }) => {
                    // String rule and the value from the condition matches with the metadata field value
                    if (isStringRule && condition.valueString === metadataFieldValue) {
                      const nodesFromThisAsset = assetMappings.filter(
                        (mapping) => mapping.assetId === asset.id
                      );

                      // get the 3d nodes linked to the asset and with treeindex and subtreeRange
                      const treeNodes: NodeAndRange[] = await Promise.all(
                        nodesFromThisAsset.map(async (nodeFromAsset) => {
                          const subtreeRange = await model.getSubtreeTreeIndices(
                            nodeFromAsset.treeIndex
                          );
                          const node: NodeAndRange = {
                            nodeId: nodeFromAsset.nodeId,
                            treeIndex: nodeFromAsset.treeIndex,
                            subtreeRange
                          };
                          return node;
                        })
                      );

                      // add the subtree range into the style index
                      const nodeIndexSet = condition.nodeIdsStyleIndex.getIndexSet();
                      treeNodes.forEach((node) => {
                        nodeIndexSet.addRange(node.subtreeRange);
                      });

                      // assign the style with the color from the condition
                      model.assignStyledNodeCollection(condition.nodeIdsStyleIndex, {
                        color: new Color(condition.color)
                      });
                    }
                  }
                );
              }
            });
          });
        }
      }); */
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
