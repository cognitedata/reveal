/*!
 * Copyright 2024 Cognite AS
 */
import { useEffect, type ReactElement, useState } from 'react';

import { CogniteCadModel } from '@cognite/reveal';
import { ModelMappingsWithAssets, useAllMappedEquipmentAssetMappings } from '../..';
import {
  type RuleOutputSet,
  type AssetStylingGroupAndStyleIndex,
  type EmptyRuleForSelectionProps
} from './types';
import { generateRuleBasedOutputs } from './utils';
import { use3dModels } from '../../hooks/use3dModels';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { type AssetMapping3D, type Asset } from '@cognite/sdk';

export type ColorOverlayProps = {
  ruleSet: RuleOutputSet | undefined;
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

  useEffect(() => {
    if (!isFetching && (hasNextPage ?? false)) {
      void fetchNextPage();
    }
  }, [isFetching, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (onRuleSetChanged !== undefined) onRuleSetChanged(stylingGroups);
  }, [stylingGroups]);

  useEffect(() => {
    if (assetMappings === undefined || models === undefined || isFetching) return;

    setStylingsGroups(EMPTY_ARRAY);

    if (ruleSet === undefined) return;

    const initializeRuleBasedOutputs = async (model: CogniteCadModel): Promise<void> => {
      // parse assets and mappings
      // TODO: refactor to be sure to filter only the mappings/assets for the current model within the pages
      const flatAssetsMappingsList: AssetMapping3D[] = assetMappings.pages
        .flat()
        .flatMap((item: ModelMappingsWithAssets) => item.mappings.items);

      const contextualizedAssetNodes = assetMappings.pages
        .flat()
        .flatMap((item: ModelMappingsWithAssets) => item.assets)
        .map(convertAssetMetadataKeysToLowerCase);

      const collectionStylings = await generateRuleBasedOutputs(
        model,
        contextualizedAssetNodes,
        flatAssetsMappingsList,
        ruleSet
      );

      setStylingsGroups(collectionStylings);
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

function convertAssetMetadataKeysToLowerCase(asset: Asset): Asset {
  return {
    ...asset,
    metadata: Object.fromEntries(
      [...Object.entries(asset.metadata ?? {})].map(
        ([key, value]) => [key.toLowerCase(), value] as const
      )
    )
  };
}
