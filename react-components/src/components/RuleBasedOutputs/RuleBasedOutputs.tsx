/*!
 * Copyright 2023 Cognite AS
 */
import { useEffect, type ReactElement } from 'react';

import { type IdEither, type AssetMapping3D, type CogniteClient } from '@cognite/sdk';
import { type CogniteCadModel } from '@cognite/reveal';
import { useReveal } from '../..';
import { Color } from 'three';
import { type RuleOutputSet } from './types';
import { useSDK } from '../RevealCanvas/SDKProvider';
import { generateRuleBasedOutputs } from './utils';

export type ColorOverlayProps = {
  ruleSet: RuleOutputSet | undefined;
};

export function RuleBasedOutputs({ ruleSet }: ColorOverlayProps): ReactElement | undefined {
  const cdfClient = useSDK();

  const viewer = useReveal();

  if (viewer.models.length === 0) return;

  const models = viewer.models;

  // with no rule selected, return to the default appearance
  if (ruleSet === undefined) {
    models.forEach((model) => {
      const currentModel = model as CogniteCadModel;
      currentModel.removeAllStyledNodeCollections();

      currentModel.setDefaultNodeAppearance({
        color: new Color('#efefef')
      });
    });

    return <></>;
  }

  useEffect(() => {
    const getContextualization = async (model: CogniteCadModel): Promise<void> => {
      const { modelId, revisionId } = model;

      const assetMappings = await getCdfCadContextualization({
        sdk: cdfClient,
        modelId,
        revisionId,
        nodeId: undefined,
        assetId: undefined
      });

      // remove duplicated
      const uniqueContextualizedAssetIds = [...new Set(assetMappings.map((node) => node.assetId))];

      const contextualizedAssetIds = uniqueContextualizedAssetIds.map((id) => {
        return { id };
      }) as unknown as IdEither[];

      // get the assets with asset info from the asset ids
      const contextualizedAssetNodes = await cdfClient.assets.retrieve(contextualizedAssetIds);

      // generate rule based coloring
      generateRuleBasedOutputs(model, contextualizedAssetNodes, assetMappings, ruleSet);
    };

    models.forEach((model) => {
      void getContextualization(model as CogniteCadModel);
    });
  }, []);

  return <></>;
}

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
  const filter = { nodeId, assetId };

  return await sdk.assetMappings3D
    .list(modelId, revisionId, filter)
    .autoPagingToArray({ limit: Infinity });
};
