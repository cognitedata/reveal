import { Context, createContext } from 'react';
import {
  use3dModels,
  useAssetMappedNodesForRevisions,
  useMappedEdgesForRevisions
} from '../../hooks';
import { useAll3dDirectConnectionsWithProperties } from '../../query';
import { useGetDMConnectionWithNodeFromHybridMappingsQuery } from './hooks/useGetDMConnectionWithNodeFromHybridMappingsQuery';
import { generateRuleBasedOutputs } from './core/generateRuleBasedOutputs';
import { type CadModelOptions } from '../Reveal3DResources';
import { type InternalId } from '@cognite/sdk';
import { type DmCadAssetMapping } from '../CacheProvider/cad/assetMappingTypes';
import { type FdmConnectionWithNode } from '../CacheProvider/types';
import { useFetchClassicAssetsByIds } from '../../query/useFetchClassicAssetsByIds';

export type RuleBasedOutputsSelectorDependencies = {
  use3dModels: typeof use3dModels;
  useAssetMappedNodesForRevisions: (
    cadModels: CadModelOptions[]
  ) => Pick<ReturnType<typeof useAssetMappedNodesForRevisions>, 'data' | 'isInitialLoading'>;
  useMappedEdgesForRevisions: (
    cadModels: CadModelOptions[],
    enabled: boolean
  ) => Pick<ReturnType<typeof useMappedEdgesForRevisions>, 'data' | 'isInitialLoading'>;
  useAll3dDirectConnectionsWithProperties: (
    connectionWithNodeAndView: FdmConnectionWithNode[]
  ) => Pick<
    ReturnType<typeof useAll3dDirectConnectionsWithProperties>,
    'data' | 'isInitialLoading'
  >;
  useGetDMConnectionWithNodeFromHybridMappingsQuery: (
    nodeWithDmIdsFromHybridMappings: DmCadAssetMapping[],
    models: CadModelOptions[]
  ) => Pick<
    ReturnType<typeof useGetDMConnectionWithNodeFromHybridMappingsQuery>,
    'data' | 'isInitialLoading'
  >;
  useFetchClassicAssetsByIds: (
    assetIdsToFilter: InternalId[]
  ) => Pick<
    ReturnType<typeof useFetchClassicAssetsByIds>,
    'data' | 'isInitialLoading' | 'isFetched'
  >;
  generateRuleBasedOutputs: typeof generateRuleBasedOutputs;
};

export const defaultRuleBasedOutputsSelectorDependencies: RuleBasedOutputsSelectorDependencies = {
  use3dModels,
  useAssetMappedNodesForRevisions,
  useMappedEdgesForRevisions,
  useAll3dDirectConnectionsWithProperties,
  useGetDMConnectionWithNodeFromHybridMappingsQuery,
  useFetchClassicAssetsByIds,
  generateRuleBasedOutputs
};

export const RuleBasedOutputsSelectorContext: Context<RuleBasedOutputsSelectorDependencies> = createContext<RuleBasedOutputsSelectorDependencies>(
  defaultRuleBasedOutputsSelectorDependencies
);
