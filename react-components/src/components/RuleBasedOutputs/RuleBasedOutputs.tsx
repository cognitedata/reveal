/*!
 * Copyright 2023 Cognite AS
 */
import { useEffect, type ReactElement } from 'react';

import { type CogniteCadModel } from '@cognite/reveal';
import { useAllMappedEquipmentAssetMappings, useReveal } from '../..';
import { Color } from 'three';
import { type RuleOutputSet } from './types';
import { generateRuleBasedOutputs } from './utils';

export type ColorOverlayProps = {
  ruleSet: RuleOutputSet | undefined;
};

export function RuleBasedOutputs({ ruleSet }: ColorOverlayProps): ReactElement | undefined {
  const viewer = useReveal();

  // only enabled whether has loaded models
  if (viewer.models === undefined || viewer.models.length === 0) return;

  const models = viewer.models;

  const {
    data: assetMappings,
    isFetching,
    hasNextPage,
    fetchNextPage
  } = useAllMappedEquipmentAssetMappings(models);

  // clean up the appearance
  models.forEach((model) => {
    const currentModel = model as CogniteCadModel;
    currentModel.removeAllStyledNodeCollections();

    currentModel.setDefaultNodeAppearance({
      color: new Color('#efefef')
    });
  });

  useEffect(() => {
    if (!isFetching && hasNextPage !== undefined) {
      void fetchNextPage();
    }
  }, [isFetching, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (assetMappings === undefined || isFetching) return;
    if (ruleSet === undefined) return;

    const initializeRuleBasedOutputs = async (model: CogniteCadModel): Promise<void> => {
      // parse assets and mappings
      const flatAssetsMappingsList =
        assetMappings?.pages
          .flat()
          .map((item) => item.mappings)
          .flat() ?? [];
      const flatMappings = flatAssetsMappingsList.map((node) => node.items).flat();
      const contextualizedAssetNodes =
        assetMappings?.pages
          .flat()
          .map((item) => item.assets)
          .flat() ?? [];

      // ========= Generate Rule Based Outputs
      generateRuleBasedOutputs(model, contextualizedAssetNodes, flatMappings, ruleSet);
    };

    models.forEach((model) => {
      void initializeRuleBasedOutputs(model as CogniteCadModel);
    });
  }, [assetMappings, ruleSet, models]);

  return <></>;
}
