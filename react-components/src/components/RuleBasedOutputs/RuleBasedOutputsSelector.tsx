/*!
 * Copyright 2024 Cognite AS
 */
import { useEffect, type ReactElement, useState } from 'react';

import { CogniteCadModel } from '@cognite/reveal';
import { type RuleOutputSet, type AssetStylingGroupAndStyleIndex } from './types';
import { generateRuleBasedOutputs } from './utils';
import { use3dModels } from '../../hooks/use3dModels';
import { type Datapoints, type Asset, type AssetMapping3D } from '@cognite/sdk';
import { isDefined } from '../../utilities/isDefined';
import { type AssetIdsAndTimeseries } from '../../data-providers/types';
import { useAssetsAndTimeseriesLinkageDataQuery } from '../../query/useAssetsAndTimeseriesLinkageDataQuery';
import { useAssetMappedNodesForRevisions } from '../CacheProvider/AssetMappingAndNode3DCacheProvider';
import { type CadModelOptions } from '../Reveal3DResources/types';
import { useAssetsByIdsQuery } from '../../query/useAssetsByIdsQuery';
import { useCreateAssetMappingsMapPerModel } from '../../hooks/useCreateAssetMappingsMapPerModel';
import { useExtractUniqueAssetIdsFromMapped } from './hooks/useExtractUniqueAssetIdsFromMapped';
import { useConvertAssetMetadatasToLowerCase } from './hooks/useConvertAssetMetadatasToLowerCase';
import { useExtractTimeseriesIdsFromRuleSet } from './hooks/useExtractTimeseriesIdsFromRuleSet';

export type ColorOverlayProps = {
  ruleSet: RuleOutputSet | undefined;
  onRuleSetChanged?: (currentStylings: AssetStylingGroupAndStyleIndex[] | undefined) => void;
};

const ruleSetStylingCache = new Map<string, AssetStylingGroupAndStyleIndex[]>();

export function RuleBasedOutputsSelector({
  ruleSet,
  onRuleSetChanged
}: ColorOverlayProps): ReactElement | undefined {
  if (ruleSet === undefined) return;

  const models = use3dModels();

  const [allContextualizedAssets, setAllContextualizedAssets] = useState<Asset[]>();

  const cadModels: CadModelOptions[] = models
    .filter((model) => model instanceof CogniteCadModel)
    .map((model) => {
      return { type: 'cad', modelId: model.modelId, revisionId: model.revisionId };
    });

  const { data: assetMappings } = useAssetMappedNodesForRevisions(cadModels);

  const assetIdsFromMapped = useExtractUniqueAssetIdsFromMapped(assetMappings);

  const { data: mappedAssets, isFetched } = useAssetsByIdsQuery(assetIdsFromMapped);

  useEffect(() => {
    if (isFetched) {
      setAllContextualizedAssets(mappedAssets);
    }
  }, [mappedAssets, isFetched]);

  const contextualizedAssetNodes = useConvertAssetMetadatasToLowerCase(allContextualizedAssets);

  const timeseriesExternalIds = useExtractTimeseriesIdsFromRuleSet(ruleSet);

  const { isLoading: isLoadingAssetIdsAndTimeseriesData, data: assetIdsWithTimeseriesData } =
    useAssetsAndTimeseriesLinkageDataQuery({
      timeseriesExternalIds,
      contextualizedAssetNodes
    });

  const flatAssetsMappingsListPerModel = useCreateAssetMappingsMapPerModel(models, assetMappings);

  useEffect(() => {
    if (assetMappings === undefined || models === undefined || !isFetched) return;
    if (timeseriesExternalIds.length > 0 && isLoadingAssetIdsAndTimeseriesData) return;
    if (ruleSet === undefined) return;

    const ruleBasedInitilization = async (): Promise<void> => {
      const allStylings = await Promise.all(
        models.map(async (model) => {
          if (!(model instanceof CogniteCadModel)) {
            return;
          }

          const flatAssetsMappingsList = flatAssetsMappingsListPerModel.get(model) ?? [];

          if (flatAssetsMappingsList.length === 0) return [];
          const stylings = await initializeRuleBasedOutputs({
            assetMappings: flatAssetsMappingsList,
            contextualizedAssetNodes,
            ruleSet,
            assetIdsAndTimeseries: assetIdsWithTimeseriesData?.assetIdsWithTimeseries ?? [],
            timeseriesDatapoints: assetIdsWithTimeseriesData?.timeseriesDatapoints ?? []
          });
          const filteredStylings = stylings.flat().filter(isDefined);
          return filteredStylings;
        })
      );
      const filteredStylings = allStylings.flat().filter(isDefined).flat();
      ruleSetStylingCache.set(ruleSet.id, filteredStylings);

      if (onRuleSetChanged !== undefined) {
        onRuleSetChanged(filteredStylings);
      }
    };
    if (!ruleSetStylingCache.has(ruleSet.id)) {
      void ruleBasedInitilization();
    } else {
      if (onRuleSetChanged !== undefined) onRuleSetChanged(ruleSetStylingCache.get(ruleSet.id));
    }
  }, [isLoadingAssetIdsAndTimeseriesData, ruleSet, assetMappings, allContextualizedAssets]);

  return <></>;
}

async function initializeRuleBasedOutputs({
  assetMappings,
  contextualizedAssetNodes,
  ruleSet,
  assetIdsAndTimeseries,
  timeseriesDatapoints
}: {
  assetMappings: AssetMapping3D[];
  contextualizedAssetNodes: Asset[];
  ruleSet: RuleOutputSet;
  assetIdsAndTimeseries: AssetIdsAndTimeseries[];
  timeseriesDatapoints: Datapoints[] | undefined;
}): Promise<AssetStylingGroupAndStyleIndex[]> {
  const collectionStylings = await generateRuleBasedOutputs({
    contextualizedAssetNodes,
    assetMappings,
    ruleSet,
    assetIdsAndTimeseries,
    timeseriesDatapoints
  });

  return collectionStylings;
}
