/*!
 * Copyright 2024 Cognite AS
 */
import { useEffect, type ReactElement, useState, useMemo } from 'react';

import { CogniteCadModel } from '@cognite/reveal';
import { type RuleOutputSet, type AllMappingStylingGroupAndStyleIndex } from './types';
import { generateRuleBasedOutputs } from './utils';
import { use3dModels } from '../../hooks/use3dModels';
import { type Datapoints, type Asset, type AssetMapping3D } from '@cognite/sdk';
import { isDefined } from '../../utilities/isDefined';
import {
  type FdmInstanceNodeWithConnectionAndProperties,
  type AssetIdsAndTimeseries
} from '../../data-providers/types';
import { useAssetsAndTimeseriesLinkageDataQuery } from '../../query/useAssetsAndTimeseriesLinkageDataQuery';
import { useAssetMappedNodesForRevisions } from '../CacheProvider/AssetMappingAndNode3DCacheProvider';
import { type CadModelOptions } from '../Reveal3DResources/types';
import { useAssetsByIdsQuery } from '../../query/useAssetsByIdsQuery';
import { useCreateAssetMappingsMapPerModel } from '../../hooks/useCreateAssetMappingsMapPerModel';
import { useExtractUniqueAssetIdsFromMapped } from './hooks/useExtractUniqueAssetIdsFromMapped';
import { useConvertAssetMetadatasToLowerCase } from './hooks/useConvertAssetMetadatasToLowerCase';
import { useExtractTimeseriesIdsFromRuleSet } from './hooks/useExtractTimeseriesIdsFromRuleSet';
import { useMappedEdgesForRevisions } from '../CacheProvider/NodeCacheProvider';
import { useAll3dDirectConnectionsWithProperties } from '../../query/useAll3dDirectConnectionsWithProperties';

export type ColorOverlayProps = {
  ruleSet: RuleOutputSet | undefined;
  onRuleSetChanged?: (currentStylings: AllMappingStylingGroupAndStyleIndex[] | undefined) => void;
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

  const assetIdsFromMapped = useExtractUniqueAssetIdsFromMapped(assetMappings);

  const { data: mappedAssets, isFetched: isAssetMappingsFetched } =
    useAssetsByIdsQuery(assetIdsFromMapped);

  const { data: fdmMappedEquipmentEdges } = useMappedEdgesForRevisions(cadModels, true);

  const fdmConnectionWithNodeAndViewList =
    fdmMappedEquipmentEdges !== undefined
      ? Array.from(fdmMappedEquipmentEdges.values()).flat()
      : [];

  const { data: fdmMappings } = useAll3dDirectConnectionsWithProperties(
    fdmConnectionWithNodeAndViewList
  );

  useEffect(() => {
    if (isAssetMappingsFetched) {
      setAllContextualizedAssets(mappedAssets);
    }
  }, [mappedAssets, isAssetMappingsFetched]);

  const contextualizedAssetNodes = useConvertAssetMetadatasToLowerCase(allContextualizedAssets);

  const timeseriesExternalIds = useExtractTimeseriesIdsFromRuleSet(ruleSet);

  const { isLoading: isLoadingAssetIdsAndTimeseriesData, data: assetIdsWithTimeseriesData } =
    useAssetsAndTimeseriesLinkageDataQuery({
      timeseriesExternalIds,
      contextualizedAssetNodes
    });

  const flatAssetsMappingsListPerModel = useCreateAssetMappingsMapPerModel(models, assetMappings);

  const allStyling = useMemo(async () => {
    if ((assetMappings === undefined && fdmMappings === undefined) || models === undefined) return;
    if (timeseriesExternalIds.length > 0 && isLoadingAssetIdsAndTimeseriesData) return;
    if (ruleSet === undefined) return;

    const ruleBasedInitilization = async (): Promise<AllMappingStylingGroupAndStyleIndex[]> => {
      const allStylings = await Promise.all(
        models.map(async (model) => {
          if (!(model instanceof CogniteCadModel)) {
            return;
          }

          const flatAssetsMappingsList = flatAssetsMappingsListPerModel.get(model) ?? [];

          if (flatAssetsMappingsList.length === 0) return [];

          const mappingsStylings = await initializeRuleBasedOutputs({
            assetMappings: flatAssetsMappingsList ?? [],
            fdmMappings: fdmMappings ?? [],
            contextualizedAssetNodes,
            ruleSet,
            assetIdsAndTimeseries: assetIdsWithTimeseriesData?.assetIdsWithTimeseries ?? [],
            timeseriesDatapoints: assetIdsWithTimeseriesData?.timeseriesDatapoints ?? []
          });

          return mappingsStylings;
        })
      );
      const filteredStylings = allStylings.flat().filter(isDefined).flat();

      return filteredStylings;
    };

    return await ruleBasedInitilization();
  }, [
    isLoadingAssetIdsAndTimeseriesData,
    ruleSet,
    assetMappings,
    fdmMappings,
    allContextualizedAssets
  ]);

  useEffect(() => {
    const triggerStyling = async (): Promise<void> => {
      const styling = await allStyling;
      if (onRuleSetChanged !== undefined) onRuleSetChanged(styling);
    };

    void triggerStyling();
  }, [allStyling]);

  return <></>;
}

async function initializeRuleBasedOutputs({
  assetMappings,
  fdmMappings,
  contextualizedAssetNodes,
  ruleSet,
  assetIdsAndTimeseries,
  timeseriesDatapoints
}: {
  assetMappings: AssetMapping3D[];
  fdmMappings: FdmInstanceNodeWithConnectionAndProperties[];
  contextualizedAssetNodes: Asset[];
  ruleSet: RuleOutputSet;
  assetIdsAndTimeseries: AssetIdsAndTimeseries[];
  timeseriesDatapoints: Datapoints[] | undefined;
}): Promise<AllMappingStylingGroupAndStyleIndex[]> {
  const collectionStylings = await generateRuleBasedOutputs({
    contextualizedAssetNodes,
    assetMappings,
    fdmMappings,
    ruleSet,
    assetIdsAndTimeseries,
    timeseriesDatapoints
  });

  return collectionStylings;
}
