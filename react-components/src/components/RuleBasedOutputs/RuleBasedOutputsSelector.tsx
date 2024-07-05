/*!
 * Copyright 2024 Cognite AS
 */
import { useEffect, type ReactElement, useState, useMemo } from 'react';

import { CogniteCadModel } from '@cognite/reveal';
import { useAllMappedEquipmentAssetMappings } from '../..';
import { type RuleOutputSet, type AssetStylingGroupAndStyleIndex } from './types';
import { generateRuleBasedOutputs, traverseExpressionToGetTimeseries } from './utils';
import { use3dModels } from '../../hooks/use3dModels';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { type Datapoints, type Asset, type AssetMapping3D } from '@cognite/sdk';
import { isDefined } from '../../utilities/isDefined';
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
    data: modelAssetPage,
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
      modelAssetPage?.pages
        .flat()
        .flatMap((modelsAssetPage) =>
          modelsAssetPage.modelsAssets.flatMap((modelsAsset) => modelsAsset.assets)
        )
        .map(convertAssetMetadataKeysToLowerCase) ?? []
    );
  }, [modelAssetPage]);

  const assetMappings = useMemo(() => {
    return (
      modelAssetPage?.pages
        .flat()
        .flatMap((modelAssetPage) => modelAssetPage.modelsAssets)
        .flatMap((node) => node.mappings)
        .filter(isDefined) ?? []
    );
  }, [modelAssetPage]);

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
    if (modelAssetPage === undefined || models === undefined || isFetching) return;
    if (timeseriesExternalIds.length > 0 && isLoadingAssetIdsAndTimeseriesData) return;

    setStylingsGroups(EMPTY_ARRAY);

    if (ruleSet === undefined) return;

    models.forEach(async (model) => {
      if (!(model instanceof CogniteCadModel)) {
        return;
      }
      const assetMappingsData = assetMappings.map((response) => response.items).flat();
      setStylingsGroups(
        await initializeRuleBasedOutputs({
          model,
          assetMappings: assetMappingsData,
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
  assetMappings: AssetMapping3D[];
  contextualizedAssetNodes: Asset[];
  ruleSet: RuleOutputSet;
  assetIdsAndTimeseries: AssetIdsAndTimeseries[];
  timeseriesDatapoints: Datapoints[] | undefined;
}): Promise<AssetStylingGroupAndStyleIndex[]> {
  const collectionStylings = await generateRuleBasedOutputs({
    model,
    contextualizedAssetNodes,
    assetMappings,
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
