/*!
 * Copyright 2024 Cognite AS
 */
import { useEffect, type ReactElement, useState } from 'react';

import {
  CogniteCadModel,
  TreeIndexNodeCollection,
  type CogniteModel,
  NumericRange,
  type NodeAppearance
} from '@cognite/reveal';
import { useAllMappedEquipmentAssetMappings } from '../..';
import { Color } from 'three';
import { type AssetStylingGroupAndStyleIndex } from './types';
import { generateRuleBasedOutputs } from './utils';
import { use3dModels } from '../../hooks/use3dModels';
import { type AssetMapping3D } from '@cognite/sdk/dist/src';
import { filterUndefined } from '../../utilities/filterUndefined';
import { type AssetStylingGroup, type FdmPropertyType } from '../Reveal3DResources/types';

export type ColorOverlayProps = {
  ruleSet: Record<string, any> | FdmPropertyType<Record<string, any>> | undefined;
  onRuleSetChanged?: (currentStylings: AssetStylingGroupAndStyleIndex[] | undefined) => void;
};

export function RuleBasedOutputsSelector({
  ruleSet,
  onRuleSetChanged
}: ColorOverlayProps): ReactElement | undefined {
  const models = use3dModels();

  const [stylingGroups, setStylingsGroups] = useState<AssetStylingGroupAndStyleIndex[]>();

  const {
    data: assetMappings,
    isFetching,
    hasNextPage,
    fetchNextPage
  } = useAllMappedEquipmentAssetMappings(models);

  const applyBasedNodeStyling = (
    model: CogniteModel,
    assetMappings: AssetMapping3D[]
  ): AssetStylingGroupAndStyleIndex | undefined => {
    if (!(model instanceof CogniteCadModel)) {
      return;
    }

    const baseNodeStyling = new TreeIndexNodeCollection();
    assetMappings?.forEach((assetMapping) => {
      const range = new NumericRange(assetMapping.treeIndex, assetMapping.subtreeSize);
      baseNodeStyling.getIndexSet().addRange(range);
    });
    const nodeAppearance: NodeAppearance = {
      color: new Color('#efefef')
    };
    const assetStylingGroup: AssetStylingGroup = {
      assetIds: assetMappings.map((node) => node.assetId),
      style: { cad: nodeAppearance }
    };

    const baseStylingGroup: AssetStylingGroupAndStyleIndex = {
      styleIndex: baseNodeStyling,
      assetStylingGroup
    };

    return baseStylingGroup;
  };

  useEffect(() => {
    if (!isFetching && hasNextPage === true) {
      void fetchNextPage();
    }
  }, [isFetching, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (onRuleSetChanged !== undefined) onRuleSetChanged(stylingGroups);
  }, [stylingGroups]);

  useEffect(() => {
    if (assetMappings === undefined || models === undefined || isFetching) return;

    setStylingsGroups([]);

    if (ruleSet === undefined) return;

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

      const basedNodeStyling = applyBasedNodeStyling(model, flatMappings);

      const collectionStylings = await generateRuleBasedOutputs(
        model,
        contextualizedAssetNodes,
        flatMappings,
        ruleSet
      );

      const ruleNodeCollectionStylings: AssetStylingGroupAndStyleIndex[] = [];
      for await (const styling of collectionStylings) {
        ruleNodeCollectionStylings.push(styling);
      }

      const allNodeCollectionStyling = filterUndefined([
        basedNodeStyling,
        ...ruleNodeCollectionStylings
      ]);
      setStylingsGroups(allNodeCollectionStyling);
    };

    models.forEach(async (model) => {
      if (!(model instanceof CogniteCadModel)) {
        return;
      }
      await initializeRuleBasedOutputs(model);
    });
  }, [assetMappings, ruleSet]);

  return <></>;
}
