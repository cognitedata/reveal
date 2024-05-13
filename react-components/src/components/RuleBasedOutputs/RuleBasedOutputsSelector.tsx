/*!
 * Copyright 2024 Cognite AS
 */
import { useEffect, type ReactElement, useState, useMemo } from 'react';

import { CogniteCadModel } from '@cognite/reveal';
import { type ModelMappingsWithAssets, useAllMappedEquipmentAssetMappings } from '../..';
import { type RuleOutputSet, type AssetStylingGroupAndStyleIndex } from './types';
import { generateRuleBasedOutputs, traverseExpressionToGetTimeseries } from './utils';
import { use3dModels } from '../../hooks/use3dModels';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { type Datapoints, type Asset } from '@cognite/sdk';
import { isDefined } from '../../utilities/isDefined';
import { type InfiniteData } from '@tanstack/react-query';
import { type AssetIdsAndTimeseries } from '../../utilities/types';
import { useAssetsAndTimeseriesLinkageDataQuery } from '../../query/useAssetsAndTimeseriesLinkageDataQuery';

export type ColorOverlayProps = {
  ruleSet: RuleOutputSet | undefined;
  onRuleSetChanged?: (currentStylings: AssetStylingGroupAndStyleIndex[] | undefined) => void;
};

export function RuleBasedOutputsSelector({
  ruleSet,
  onRuleSetChanged
}: ColorOverlayProps): ReactElement | undefined {
  if (ruleSet === undefined) return;

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

  const contextualizedAssetNodes = useMemo(() => {
    return (
      assetMappings?.pages
        .flat()
        .flatMap((item) => item.assets)
        .map(convertAssetMetadataKeysToLowerCase) ?? []
    );
  }, [assetMappings]);

  const timeseriesExternalIds = useMemo(() => {
    const expressions = ruleSet?.rulesWithOutputs
      .map((ruleWithOutput) => ruleWithOutput.rule.expression)
      .filter(isDefined);
    return traverseExpressionToGetTimeseries(expressions) ?? [];
  }, [ruleSet]);

  const { isLoading: isLoadingAssetIdsAndTimeseriesData, data: assetIdsWithTimeseriesData } =
    useAssetsAndTimeseriesLinkageDataQuery({
      timeseriesExternalIds,
      contextualizedAssetNodes
    });

  useEffect(() => {
    if (onRuleSetChanged !== undefined) onRuleSetChanged(stylingGroups);
  }, [stylingGroups]);

  useEffect(() => {
    if (assetMappings === undefined || models === undefined || isFetching) return;
    if (timeseriesExternalIds.length > 0 && isLoadingAssetIdsAndTimeseriesData) return;

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
      setStylingsGroups(
        await initializeRuleBasedOutputs({
          model,
          assetMappings,
          contextualizedAssetNodes,
          ruleSet,
          assetIdsAndTimeseries: assetIdsWithTimeseriesData?.assetIdsWithTimeseries ?? [],
          timeseriesDatapoints: assetIdsWithTimeseriesData?.timeseriesDatapoints ?? []
        })
      );
    });
  }, [isLoadingAssetIdsAndTimeseriesData, ruleSet]);

  return <></>;
}

async function initializeRuleBasedOutputs({
  model,
  assetMappings,
  contextualizedAssetNodes,
  ruleSet,
  assetIdsAndTimeseries,
  timeseriesDatapoints
}: {
  model: CogniteCadModel;
  assetMappings: InfiniteData<ModelMappingsWithAssets[]>;
  contextualizedAssetNodes: Asset[];
  ruleSet: RuleOutputSet;
  assetIdsAndTimeseries: AssetIdsAndTimeseries[];
  timeseriesDatapoints: Datapoints[] | undefined;
}): Promise<AssetStylingGroupAndStyleIndex[]> {
  const flatAssetsMappingsList = assetMappings.pages.flat().flatMap((item) => item.mappings);
  const flatMappings = flatAssetsMappingsList.flatMap((node) => node.items);

  const collectionStylings = await generateRuleBasedOutputs({
    model,
    contextualizedAssetNodes,
    assetMappings: flatMappings,
    ruleSet,
    assetIdsAndTimeseries,
    timeseriesDatapoints
  });

  return collectionStylings;
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
