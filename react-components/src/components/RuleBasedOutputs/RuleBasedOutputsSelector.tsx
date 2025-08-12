import { useEffect, type ReactElement, useState, useMemo } from 'react';

import { CogniteCadModel, type CogniteModel, type DataSourceType } from '@cognite/reveal';
import {
  type RuleOutputSet,
  type AllMappingStylingGroupAndStyleIndex,
  type FdmInstanceNodeWithConnectionAndProperties
} from './types';
import { use3dModels } from '../../hooks/use3dModels';
import { type Datapoints, type Asset } from '@cognite/sdk';
import { isDefined } from '../../utilities/isDefined';
import {
  type AssetIdsAndTimeseriesData,
  type AssetIdsAndTimeseries
} from '../../data-providers/types';
import { useAssetsAndTimeseriesLinkageDataQuery } from '../../query/useAssetsAndTimeseriesLinkageDataQuery';
import { type CadModelOptions } from '../Reveal3DResources/types';
import { useAssetsByIdsQuery } from '../../query/useAssetsByIdsQuery';
import { useCreateAssetMappingsMapPerModel } from '../../hooks/useCreateAssetMappingsMapPerModel';
import { useExtractUniqueClassicAssetIdsFromMapped } from './hooks/useExtractUniqueClassicAssetIdsFromMapped';
import { useConvertAssetMetadatasToLowerCase } from './hooks/useConvertAssetMetadatasToLowerCase';
import { useExtractTimeseriesIdsFromRuleSet } from './hooks/useExtractTimeseriesIdsFromRuleSet';
import { useAll3dDirectConnectionsWithProperties } from '../../query/useAll3dDirectConnectionsWithProperties';
import { useAssetMappedNodesForRevisions, useMappedEdgesForRevisions } from '../../hooks/cad';
import { generateRuleBasedOutputs } from './core/generateRuleBasedOutputs';
import {
  isClassicCadAssetMapping,
  isDmCadAssetMapping,
  type ClassicCadAssetMapping
} from '../CacheProvider/cad/assetMappingTypes';
import { useGetDMConnectionWithNodeFromHybridMappingsQuery } from './hooks/useGetDMConnectionWithNodeFromHybridMappingsQuery';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { type ModelWithAssetMappings } from '../../hooks/cad/modelWithAssetMappings';
import { type FdmConnectionWithNode } from '../CacheProvider/types';

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

  const assetIdsFromMapped = useExtractUniqueClassicAssetIdsFromMapped(assetMappings);

  const nodeWithDmIdsFromHybridMappings = useMemo(() => {
    return assetMappings?.flatMap((item) => item.assetMappings.filter(isDmCadAssetMapping));
  }, [assetMappings]);

  const {
    data: allClassicAssetConnections,
    isLoading: isAllClassicAssetConnectionsLoading,
    isFetched: isAllClassicAssetConnectionsFetched
  } = useAssetsByIdsQuery(assetIdsFromMapped);

  const { data: fdmMappedEquipmentEdges, isLoading: isFdmMappingsEdgesLoading } =
    useMappedEdgesForRevisions(cadModels, true);

  const { data: dmConnectionWithNodeFromHybridDataList } =
    useGetDMConnectionWithNodeFromHybridMappingsQuery(
      nodeWithDmIdsFromHybridMappings ?? EMPTY_ARRAY,
      cadModels
    );

  const fdmConnectionWithNodeAndViewList = useMemo(() => {
    return fdmMappedEquipmentEdges !== undefined
      ? Array.from(fdmMappedEquipmentEdges.values()).flat()
      : [];
  }, [fdmMappedEquipmentEdges]);

  const allFdmConnections = useMemo(() => {
    return fdmConnectionWithNodeAndViewList.concat(dmConnectionWithNodeFromHybridDataList ?? []);
  }, [fdmConnectionWithNodeAndViewList, dmConnectionWithNodeFromHybridDataList]);

  const { data: fdmMappings, isLoading: isFdmMappingsLoading } =
    useAll3dDirectConnectionsWithProperties(allFdmConnections);

  const allDataLoaded =
    !isAssetMappingsLoading &&
    !isAllClassicAssetConnectionsLoading &&
    !isFdmMappingsEdgesLoading &&
    !isFdmMappingsLoading;

  const contextualizedAssetNodes = useConvertAssetMetadatasToLowerCase(allContextualizedAssets);

  const timeseriesExternalIds = useExtractTimeseriesIdsFromRuleSet(ruleSet);

  const { isLoading: isLoadingAssetIdsAndTimeseriesData, data: assetIdsWithTimeseriesData } =
    useAssetsAndTimeseriesLinkageDataQuery({
      timeseriesExternalIds,
      assetNodes: contextualizedAssetNodes
    });

  const flatAssetsMappingsListPerModel = useCreateAssetMappingsMapPerModel(models, assetMappings);

  useEffect(() => {
    if (isAllClassicAssetConnectionsFetched) {
      setAllContextualizedAssets(allClassicAssetConnections);
    }
  }, [allClassicAssetConnections, isAllClassicAssetConnectionsFetched]);

  useEffect(() => {
    onAllMappingsFetched(allDataLoaded);
  }, [allDataLoaded]);

  useEffect(() => {
    if (
      !isReadyToInitializeRules(
        ruleSet,
        assetMappings,
        fdmMappings,
        timeseriesExternalIds,
        isLoadingAssetIdsAndTimeseriesData,
        allDataLoaded,
        allClassicAssetConnections,
        allFdmConnections,
        models
      )
    )
      return;

    const uniqueRuleSetKey = generateUniqueRuleSetKey(
      ruleSet,
      assetMappings,
      fdmMappings,
      contextualizedAssetNodes,
      assetIdsWithTimeseriesData,
      timeseriesExternalIds
    );

    const ruleBasedInitilization = async (): Promise<void> => {
      const allStylings = await Promise.all(
        models.map(async (model) => {
          if (!(model instanceof CogniteCadModel)) {
            return;
          }

          const flatAssetsMappingsList = flatAssetsMappingsListPerModel.get(model) ?? [];

          if (flatAssetsMappingsList.length === 0 && fdmMappings?.length === 0) return [];

          const mappingsStylings = await initializeRuleBasedOutputs(
            flatAssetsMappingsList.filter(isClassicCadAssetMapping),
            fdmMappings ?? [],
            contextualizedAssetNodes,
            ruleSet,
            assetIdsWithTimeseriesData?.assetIdsWithTimeseries ?? [],
            assetIdsWithTimeseriesData?.timeseriesDatapoints ?? []
          );

          return mappingsStylings;
        })
      );
      const filteredStylings = allStylings.flat().filter(isDefined).flat();

      ruleSetStylingCache.set(uniqueRuleSetKey, filteredStylings);

      if (onRuleSetChanged !== undefined) onRuleSetChanged(filteredStylings);
      onAllMappingsFetched(true);
    };

    const cachedStyling = ruleSetStylingCache.get(uniqueRuleSetKey);
    if (cachedStyling !== undefined) {
      onRuleSetChanged?.(cachedStyling);
      onAllMappingsFetched(true);
      return;
    }
    void ruleBasedInitilization();
  }, [
    ruleSet,
    assetMappings,
    fdmMappings,
    contextualizedAssetNodes,
    assetIdsWithTimeseriesData,
    allDataLoaded,
    allClassicAssetConnections,
    allFdmConnections,
    models
  ]);

  return <></>;
}

async function initializeRuleBasedOutputs(
  assetMappings: ClassicCadAssetMapping[],
  fdmMappings: FdmInstanceNodeWithConnectionAndProperties[],
  contextualizedAssetNodes: Asset[],
  ruleSet: RuleOutputSet,
  assetIdsAndTimeseries: AssetIdsAndTimeseries[],
  timeseriesDatapoints: Datapoints[] | undefined
): Promise<AllMappingStylingGroupAndStyleIndex[]> {
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

function generateUniqueRuleSetKey(
  ruleSet: RuleOutputSet,
  assetMappings: ModelWithAssetMappings[] | undefined,
  fdmMappings: FdmInstanceNodeWithConnectionAndProperties[] | undefined,
  contextualizedAssetNodes: Asset[],
  assetIdsWithTimeseriesData: AssetIdsAndTimeseriesData | undefined,
  timeseriesExternalIds: string[]
): string {
  return `${ruleSet.id}-${assetMappings?.length}-${fdmMappings?.length}-${contextualizedAssetNodes.length}-${assetIdsWithTimeseriesData?.assetIdsWithTimeseries.length}-${timeseriesExternalIds.length}`;
}

function isReadyToInitializeRules(
  ruleSet: RuleOutputSet | undefined,
  assetMappings: ModelWithAssetMappings[] | undefined,
  fdmMappings: FdmInstanceNodeWithConnectionAndProperties[] | undefined,
  timeseriesExternalIds: string[],
  isLoadingAssetIdsAndTimeseriesData: boolean,
  allDataLoaded: boolean,
  allClassicAssetConnections: Asset[] | undefined,
  allFdmConnections: FdmConnectionWithNode[],
  models: Array<CogniteModel<DataSourceType>> | undefined
): boolean {
  const modelsNotReady = models === undefined || models.length === 0;

  const classicAssetMappingsNotReady =
    allClassicAssetConnections !== undefined &&
    allClassicAssetConnections.length > 0 &&
    assetMappings === undefined;

  const fdmAssetMappingsNotReady = allFdmConnections.length > 0 && fdmMappings === undefined;

  const timeseriesNotReady = timeseriesExternalIds.length > 0 && isLoadingAssetIdsAndTimeseriesData;

  if (
    modelsNotReady ||
    ruleSet === undefined ||
    !allDataLoaded ||
    classicAssetMappingsNotReady ||
    fdmAssetMappingsNotReady ||
    timeseriesNotReady
  )
    return false;

  return true;
}
