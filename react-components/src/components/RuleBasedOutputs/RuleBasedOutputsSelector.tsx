import { useEffect, type ReactElement, useState, useMemo } from 'react';

import { CogniteCadModel } from '@cognite/reveal';
import {
  type RuleOutputSet,
  type AllMappingStylingGroupAndStyleIndex,
  type FdmInstanceNodeWithConnectionAndProperties
} from './types';
import { use3dModels } from '../../hooks/use3dModels';
import { type Datapoints, type Asset } from '@cognite/sdk';
import { isDefined } from '../../utilities/isDefined';
import { type AssetIdsAndTimeseries } from '../../data-providers/types';
import { useAssetsAndTimeseriesLinkageDataQuery } from '../../query/useAssetsAndTimeseriesLinkageDataQuery';
import { type CadModelOptions } from '../Reveal3DResources/types';
import { useAssetsByIdsQuery } from '../../query/useAssetsByIdsQuery';
import { useCreateAssetMappingsMapPerModel } from '../../hooks/useCreateAssetMappingsMapPerModel';
import { useExtractUniqueAssetIdsFromMapped } from './hooks/useExtractUniqueAssetIdsFromMapped';
import { useConvertAssetMetadatasToLowerCase } from './hooks/useConvertAssetMetadatasToLowerCase';
import { useExtractTimeseriesIdsFromRuleSet } from './hooks/useExtractTimeseriesIdsFromRuleSet';
import { useAll3dDirectConnectionsWithProperties } from '../../query/useAll3dDirectConnectionsWithProperties';
import { useAssetMappedNodesForRevisions, useMappedEdgesForRevisions } from '../../hooks/cad';
import { generateRuleBasedOutputs } from './core/generateRuleBasedOutputs';
import { type CdfAssetMapping } from '../CacheProvider/types';

const ruleSetStylingCache = new Map<string, AllMappingStylingGroupAndStyleIndex[]>();

export type ColorOverlayProps = {
  ruleSet: RuleOutputSet | undefined;
  onRuleSetChanged?: (currentStylings: AllMappingStylingGroupAndStyleIndex[] | undefined) => void;
  onAllMappingsFetched: (value: boolean) => void;
};

export function RuleBasedOutputsSelector({
  ruleSet,
  onRuleSetChanged,
  onAllMappingsFetched
}: ColorOverlayProps): ReactElement | undefined {
  if (ruleSet === undefined) return;

  const models = use3dModels();

  const [allContextualizedAssets, setAllContextualizedAssets] = useState<Asset[]>();

  const cadModels: CadModelOptions[] = models
    .filter((model) => model instanceof CogniteCadModel)
    .map((model) => {
      return { type: 'cad', modelId: model.modelId, revisionId: model.revisionId };
    });

  const { data: assetMappings, isLoading: isAssetMappingsLoading } =
    useAssetMappedNodesForRevisions(cadModels);

  const assetIdsFromMapped = useExtractUniqueAssetIdsFromMapped(assetMappings);

  const {
    data: mappedAssets,
    isLoading: isAssetMappedLoading,
    isFetched: isAssetMappingsFetched
  } = useAssetsByIdsQuery(assetIdsFromMapped);

  const { data: fdmMappedEquipmentEdges, isLoading: isFdmMappingsEdgesLoading } =
    useMappedEdgesForRevisions(cadModels, true);

  const fdmConnectionWithNodeAndViewList = useMemo(() => {
    return fdmMappedEquipmentEdges !== undefined
      ? Array.from(fdmMappedEquipmentEdges.values()).flat()
      : [];
  }, [fdmMappedEquipmentEdges]);

  const { data: fdmMappings, isLoading: isFdmMappingsLoading } =
    useAll3dDirectConnectionsWithProperties(fdmConnectionWithNodeAndViewList);

  const allMappingsLoaded =
    !isAssetMappingsLoading &&
    !isAssetMappedLoading &&
    !isFdmMappingsEdgesLoading &&
    !isFdmMappingsLoading;

  useEffect(() => {
    if (isAssetMappingsFetched) {
      setAllContextualizedAssets(mappedAssets);
    }
  }, [mappedAssets, isAssetMappingsFetched]);

  useEffect(() => {
    onAllMappingsFetched(allMappingsLoaded);
  }, [allMappingsLoaded]);

  const contextualizedAssetNodes = useConvertAssetMetadatasToLowerCase(allContextualizedAssets);

  const timeseriesExternalIds = useExtractTimeseriesIdsFromRuleSet(ruleSet);

  const { isLoading: isLoadingAssetIdsAndTimeseriesData, data: assetIdsWithTimeseriesData } =
    useAssetsAndTimeseriesLinkageDataQuery({
      timeseriesExternalIds,
      assetNodes: contextualizedAssetNodes
    });

  const flatAssetsMappingsListPerModel = useCreateAssetMappingsMapPerModel(models, assetMappings);

  useEffect(() => {
    if ((assetMappings === undefined && fdmMappings === undefined) || models === undefined) return;
    if (timeseriesExternalIds.length > 0 && isLoadingAssetIdsAndTimeseriesData) return;
    if (ruleSet === undefined) return;
    if (!allMappingsLoaded) return;

    const ruleBasedInitilization = async (): Promise<void> => {
      const allStylings = await Promise.all(
        models.map(async (model) => {
          if (!(model instanceof CogniteCadModel)) {
            return;
          }

          const flatAssetsMappingsList = flatAssetsMappingsListPerModel.get(model) ?? [];

          if (flatAssetsMappingsList.length === 0 && fdmMappings?.length === 0) return [];

          const mappingsStylings = await initializeRuleBasedOutputs({
            assetMappings: flatAssetsMappingsList,
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

      ruleSetStylingCache.set(ruleSet.id, filteredStylings);
      if (onRuleSetChanged !== undefined) {
        onRuleSetChanged(filteredStylings);
      }
    };
    if (!ruleSetStylingCache.has(ruleSet.id)) {
      void ruleBasedInitilization();
    } else {
      onAllMappingsFetched(true);
      if (onRuleSetChanged !== undefined) onRuleSetChanged(ruleSetStylingCache.get(ruleSet.id));
    }
  }, [
    ruleSet,
    assetMappings,
    fdmMappings,
    contextualizedAssetNodes,
    assetIdsWithTimeseriesData,
    models
  ]);

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
  assetMappings: CdfAssetMapping[];
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
