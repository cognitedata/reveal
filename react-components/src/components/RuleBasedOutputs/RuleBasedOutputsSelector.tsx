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

    const ruleBasedInitilization = async (): Promise<void> => {
      await Promise.all(
        models.map(async (model) => {
          if (!(model instanceof CogniteCadModel)) {
            return;
          }

          const flatAssetsMappingsList = assetMappings?.pages
            .flatMap((item) => item.filter((item) => item.model.modelId === model.modelId))
            .flatMap((item) => item.mappings)
            .flatMap((node) => node.items);

          const stylings = await initializeRuleBasedOutputs({
            model,
            assetMappings: flatAssetsMappingsList,
            contextualizedAssetNodes,
            ruleSet,
            assetIdsAndTimeseries: assetIdsWithTimeseriesData?.assetIdsWithTimeseries ?? [],
            timeseriesDatapoints: assetIdsWithTimeseriesData?.timeseriesDatapoints ?? []
          });

          setStylingsGroups(stylings);
        })
      );
    };
    void ruleBasedInitilization();
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
