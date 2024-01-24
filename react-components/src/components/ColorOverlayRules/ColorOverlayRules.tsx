/*!
 * Copyright 2023 Cognite AS
 */
import { useEffect, type ReactElement } from 'react';

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
import { type NodeAndRange } from './types';

type Rule = any;

export type ColorOverlayProps = {
  addModelOptions: AddModelOptions;
  rules: Rule[];
};

export function ColorOverlayRules({ addModelOptions, rules }: ColorOverlayProps): ReactElement {
  const cdfClient = useSDK();
  const viewer = useReveal();
  console.log(' RULES', rules);
  console.log(' SDK', cdfClient);

  const { modelId, revisionId } = addModelOptions;

  useEffect(() => {
    const getContextualization = async (): Promise<void> => {
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

      // go through all the rules
      rules.forEach((rule) => {
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
