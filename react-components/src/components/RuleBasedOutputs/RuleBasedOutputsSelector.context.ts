import { createContext } from 'react';
import {
  use3dModels,
  useAssetMappedNodesForRevisions,
  useMappedEdgesForRevisions
} from '../../hooks';
import { useAssetsByIdsQuery, useAll3dDirectConnectionsWithProperties } from '../../query';
import { useGetDMConnectionWithNodeFromHybridMappingsQuery } from './hooks/useGetDMConnectionWithNodeFromHybridMappingsQuery';
import { generateRuleBasedOutputs } from './core/generateRuleBasedOutputs';
import { type CadModelOptions } from '../Reveal3DResources';
import { type IdEither } from '@cognite/sdk';
import { type DmCadAssetMapping } from '../CacheProvider/cad/assetMappingTypes';
import { type FdmConnectionWithNode } from '../CacheProvider/types';
import { useFetchAllClassicAssets } from './hooks/useFetchAllClassicAssets';
import { ModelWithAssetMappings } from '../../hooks/cad/modelWithAssetMappings';

export type RuleBasedOutputsSelectorDependencies = {
  use3dModels: typeof use3dModels;
  useAssetsByIdsQuery: (
    ids: IdEither[]
  ) => Pick<ReturnType<typeof useAssetsByIdsQuery>, 'data' | 'isLoading' | 'isFetched'>;
  useAssetMappedNodesForRevisions: (
    cadModels: CadModelOptions[]
  ) => Pick<ReturnType<typeof useAssetMappedNodesForRevisions>, 'data' | 'isLoading'>;
  useMappedEdgesForRevisions: (
    cadModels: CadModelOptions[],
    enabled: boolean
  ) => Pick<ReturnType<typeof useMappedEdgesForRevisions>, 'data' | 'isLoading'>;
  useAll3dDirectConnectionsWithProperties: (
    connectionWithNodeAndView: FdmConnectionWithNode[]
  ) => Pick<ReturnType<typeof useAll3dDirectConnectionsWithProperties>, 'data' | 'isLoading'>;
  useGetDMConnectionWithNodeFromHybridMappingsQuery: (
    nodeWithDmIdsFromHybridMappings: DmCadAssetMapping[],
    models: CadModelOptions[]
  ) => Pick<
    ReturnType<typeof useGetDMConnectionWithNodeFromHybridMappingsQuery>,
    'data' | 'isLoading'
  >;
  useFetchAllClassicAssets: () => Pick<ReturnType<typeof useFetchAllClassicAssets>, 'data' | 'isLoading' | 'isFetched'>;
  generateRuleBasedOutputs: typeof generateRuleBasedOutputs;
};

export const defaultRuleBasedOutputsSelectorDependencies: RuleBasedOutputsSelectorDependencies = {
  use3dModels,
  useAssetsByIdsQuery,
  useAssetMappedNodesForRevisions,
  useMappedEdgesForRevisions,
  useAll3dDirectConnectionsWithProperties,
  useGetDMConnectionWithNodeFromHybridMappingsQuery,
  useFetchAllClassicAssets,
  generateRuleBasedOutputs
};

export const RuleBasedOutputsSelectorContext = createContext<RuleBasedOutputsSelectorDependencies>(
  defaultRuleBasedOutputsSelectorDependencies
);
