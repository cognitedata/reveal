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
import { NodeIdNodeCollection, type AddModelOptions, DefaultNodeAppearance, CogniteCadModel } from '@cognite/reveal';
import { useSDK } from '../RevealContainer/SDKProvider';
import { useReveal } from '../..';

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

      // remove duplicated
      const uniqueContextualizedAssetIds = [...new Set(assetMappings.map((node) => node.assetId))];

      const contextualizedThreeDNodeIds = assetMappings.map((node) => node.nodeId)

      const contextualizedAssetIds = uniqueContextualizedAssetIds.map((id) => {
        return { id };
      }) as unknown as IdEither[];
      console.log(' ids ', contextualizedAssetIds);
      const contextualizedAssetNodes = await cdfClient.assets.retrieve(contextualizedAssetIds);

      console.log(' viewer scene', viewer);
      console.log(' rules ', rules);
      console.log(' contextualizedNodes ', contextualizedThreeDNodeIds);
      console.log(' contextualizedAssets ', contextualizedAssetNodes);

      const model = viewer.models[0] as CogniteCadModel;
      console.log(' model ', model);

      const nodes = new NodeIdNodeCollection(cdfClient, model);

      await nodes.executeFilter(contextualizedThreeDNodeIds);
      model.assignStyledNodeCollection(nodes, DefaultNodeAppearance.Highlighted);

      rules.forEach((rule) => {
        const conditions = rule.conditions;
        const isStringRule = rule.isStringRule as boolean;
        if (rule.rulerTriggerType === 'metadata') {
          contextualizedAssetNodes.forEach((asset) => {
            rule.sourceField.forEach((sourceField: any) => {
              const metadataFieldValue = asset.metadata?.[sourceField];
              if (asset.metadata !== null && metadataFieldValue !== null) {
                conditions.forEach((condition: { valueString: any }) => {
                  if (isStringRule) {
                    if (condition.valueString === metadataFieldValue) {

                    }
                  }
                });
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
