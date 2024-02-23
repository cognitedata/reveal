/*!
 * Copyright 2023 Cognite AS
 */
import { useEffect, type ReactElement, useState } from 'react';

import { CogniteCadModel, TreeIndexNodeCollection, type CogniteModel } from '@cognite/reveal';
import { useAllMappedEquipmentAssetMappings } from '../..';
import { Color } from 'three';
import { type RuleOutputSet } from './types';
import { generateRuleBasedOutputs } from './utils';
import { use3dModels } from '../../hooks/use3dModels';

export type ColorOverlayProps = {
  ruleSet: RuleOutputSet | undefined;
};

export function RuleBasedOutputsSelector({ ruleSet }: ColorOverlayProps): ReactElement | undefined {
  const models = use3dModels();

  const [nodeCollectionStylings, setNodeCollectionStylings] = useState<TreeIndexNodeCollection[]>();

  const {
    data: assetMappings,
    isFetching,
    hasNextPage,
    fetchNextPage
  } = useAllMappedEquipmentAssetMappings(models);

  useEffect(() => {
    if (!isFetching && hasNextPage === true) {
      void fetchNextPage();
    }
  }, [isFetching, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (assetMappings === undefined || isFetching) return;

    cleanupNodeStylings(models, nodeCollectionStylings);

    if (ruleSet === undefined) return;

    const basedNodeStyling = applyBasedNodeStyling(models);

    const initializeRuleBasedOutputs = async (model: CogniteCadModel): Promise<void> => {
      // parse assets and mappings
      // TODO: refactor to be sure to filter only the mappings/assets for the current model within the pages
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

      const collectionStylings = await generateRuleBasedOutputs(
        model,
        contextualizedAssetNodes,
        flatMappings,
        ruleSet
      );

      const ruleNodeCollectionStylings: TreeIndexNodeCollection[] = [];
      for await (const styling of collectionStylings) {
        ruleNodeCollectionStylings.push(styling);
      }

      const allNodeCollectionStyling = [basedNodeStyling, ...ruleNodeCollectionStylings];
      setNodeCollectionStylings(allNodeCollectionStyling);
    };

    models.forEach(async (model) => {
      if (!(model instanceof CogniteCadModel)) {
        return;
      }
      await initializeRuleBasedOutputs(model);
    });
  }, [assetMappings, ruleSet, models]);

  return <></>;
}

const cleanupNodeStylings = (
  models: CogniteModel[],
  nodeCollectionStylings: TreeIndexNodeCollection[] | undefined
): void => {
  // clean up the appearance
  models.forEach((model) => {
    if (!(model instanceof CogniteCadModel)) {
      return undefined;
    }
    nodeCollectionStylings?.forEach((nodeStyling) => {
      model.unassignStyledNodeCollection(nodeStyling);
    });
  });
};

const applyBasedNodeStyling = (models: CogniteModel[]): TreeIndexNodeCollection => {
  const baseNodeStyling = new TreeIndexNodeCollection();

  models.forEach((model) => {
    if (!(model instanceof CogniteCadModel)) {
      return;
    }
    model.assignStyledNodeCollection(
      baseNodeStyling,
      {
        color: new Color('#efefef')
      },
      1
    );
  });
  return baseNodeStyling;
};
