/*!
 * Copyright 2024 Cognite AS
 */
import { useEffect, type ReactElement, useState } from 'react';

import { CogniteCadModel } from '@cognite/reveal';
import { useAllMappedEquipmentAssetMappings } from '../..';
import { type RuleOutputSet, type AssetStylingGroupAndStyleIndex } from './types';
import { generateRuleBasedOutputs, traverseExpressionToGetTimeseries } from './utils';
import { use3dModels } from '../../hooks/use3dModels';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { type Asset } from '@cognite/sdk';
import { isDefined } from '../../utilities/isDefined';
import { useAssetIdsFromTimeseriesQuery } from '../../query/useAssetIdsFromTimeseriesQuery';
import { useTimeseriesLatestDatapointQuery } from '../../query/useTimeseriesLatestDatapointQuery';

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

  const expressions = ruleSet?.rulesWithOutputs
    .map((ruleSet) => ruleSet.rule.expression)
    .filter(isDefined);
  const timeseriesExternalIdsFromRule = traverseExpressionToGetTimeseries(expressions) ?? [];

  const assetAndTimeseriesIds = useAssetIdsFromTimeseriesQuery(timeseriesExternalIdsFromRule);
  const timeseriesDatapoints = useTimeseriesLatestDatapointQuery(
    assetAndTimeseriesIds
      .map((item): number | undefined => {
        return item.timeseries?.id;
      })
      .filter(isDefined)
  );

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

    setStylingsGroups(EMPTY_ARRAY);

    if (ruleSet === undefined) return;

    const initializeRuleBasedOutputs = async (model: CogniteCadModel): Promise<void> => {
      // parse assets and mappings
      // TODO: refactor to be sure to filter only the mappings/assets for the current model within the pages
      const flatAssetsMappingsList = assetMappings.pages
        .flat()
        .map((item) => item.mappings)
        .flat();
      const flatMappings = flatAssetsMappingsList.map((node) => node.items).flat();
      const contextualizedAssetNodes = assetMappings.pages
        .flat()
        .flatMap((item) => item.assets)
        .map(convertAssetMetadataKeysToLowerCase);

      const collectionStylings = await generateRuleBasedOutputs({
        model,
        contextualizedAssetNodes,
        assetMappings: flatMappings,
        ruleSet,
        assetAndTimeseriesIds,
        timeseriesDatapoints
      });

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
