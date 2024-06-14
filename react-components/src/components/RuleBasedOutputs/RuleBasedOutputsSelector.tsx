/*!
 * Copyright 2024 Cognite AS
 */
import { useEffect, type ReactElement, useState, useMemo } from 'react';

import { CogniteCadModel } from '@cognite/reveal';
import { type RuleOutputSet, type AssetStylingGroupAndStyleIndex } from './types';
import { generateRuleBasedOutputs, traverseExpressionToGetTimeseries } from './utils';
import { use3dModels } from '../../hooks/use3dModels';
import { type Datapoints, type Asset, type AssetMapping3D, type InternalId } from '@cognite/sdk';
import { isDefined } from '../../utilities/isDefined';
import { type AssetIdsAndTimeseries } from '../../utilities/types';
import { useAssetsAndTimeseriesLinkageDataQuery } from '../../query/useAssetsAndTimeseriesLinkageDataQuery';
import { uniqBy } from 'lodash';
import { useAssetMappedNodesForRevisions } from '../CacheProvider/AssetMappingCacheProvider';
import { type CadModelOptions } from '../Reveal3DResources/types';
import { useAssetsByIdsQuery } from '../../query/useAssetsByIdsQuery';

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

  const [allContextualizedAssets, setAllContextualizedAssets] = useState<Asset[]>();

  const cadModels: CadModelOptions[] = models
    .filter((model) => model instanceof CogniteCadModel)
    .map((model) => {
      return { type: 'cad', modelId: model.modelId, revisionId: model.revisionId };
    });

  const { data: assetMappings } = useAssetMappedNodesForRevisions(cadModels);

  const assetIdsFromMapped = useMemo(() => {
    const mappings = assetMappings?.map((item) => item.assetMappings).flat() ?? [];
    const assetIds: InternalId[] = mappings.flatMap((item) => {
      return {
        id: item.assetId
      };
    });
    const uniqueAssetIds = uniqBy(assetIds, 'id');
    return uniqueAssetIds;
  }, [assetMappings]);

  const { data: mappedAssets, isFetched } = useAssetsByIdsQuery(assetIdsFromMapped);

  useEffect(() => {
    if (isFetched) {
      setAllContextualizedAssets(mappedAssets);
    }
  }, [mappedAssets, isFetched]);

  const contextualizedAssetNodes = useMemo(() => {
    const metadataConvertedContextualizedAssetNodes = allContextualizedAssets
      ?.filter(isDefined)
      .map(convertAssetMetadataKeysToLowerCase);

    return metadataConvertedContextualizedAssetNodes ?? [];
  }, [allContextualizedAssets]);

  const flatAssetsMappingsListPerModel = useMemo(() => {
    const mappingsPerModel = new Map<CogniteCadModel, AssetMapping3D[] | undefined>();
    models.forEach((model) => {
      if (!(model instanceof CogniteCadModel)) {
        return;
      }
      const flatAssetsMappingsList =
        assetMappings
          ?.filter((item) => item.model.modelId === model.modelId)
          .map((item) => item.assetMappings)
          .flat()
          .filter(isDefined) ?? [];

      mappingsPerModel.set(model, flatAssetsMappingsList);
    });

    return mappingsPerModel;
  }, [assetMappings, models]);

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
      if (onRuleSetChanged !== undefined) onRuleSetChanged(filteredStylings);
    };
    void ruleBasedInitilization();
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
