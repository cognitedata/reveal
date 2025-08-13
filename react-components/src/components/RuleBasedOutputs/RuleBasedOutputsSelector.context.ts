import { createContext } from 'react';
import {
  use3dModels,
  useAssetMappedNodesForRevisions,
  useMappedEdgesForRevisions
} from '../../hooks';
import { useAssetsByIdsQuery, useAll3dDirectConnectionsWithProperties } from '../../query';
import { useGetDMConnectionWithNodeFromHybridMappingsQuery } from './hooks/useGetDMConnectionWithNodeFromHybridMappingsQuery';
import { generateRuleBasedOutputs } from './core/generateRuleBasedOutputs';

export type RuleBasedOutputsSelectorDependencies = {
  use3dModels: typeof use3dModels;
  useAssetsByIdsQuery: typeof useAssetsByIdsQuery;
  useAssetMappedNodesForRevisions: typeof useAssetMappedNodesForRevisions;
  useMappedEdgesForRevisions: typeof useMappedEdgesForRevisions;
  useAll3dDirectConnectionsWithProperties: typeof useAll3dDirectConnectionsWithProperties;
  useGetDMConnectionWithNodeFromHybridMappingsQuery: typeof useGetDMConnectionWithNodeFromHybridMappingsQuery;
  generateRuleBasedOutputs: typeof generateRuleBasedOutputs;
};

export const defaultRuleBasedOutputsSelectorDependencies: RuleBasedOutputsSelectorDependencies = {
  use3dModels,
  useAssetsByIdsQuery,
  useAssetMappedNodesForRevisions,
  useMappedEdgesForRevisions,
  useAll3dDirectConnectionsWithProperties,
  useGetDMConnectionWithNodeFromHybridMappingsQuery,
  generateRuleBasedOutputs
};

export const RuleBasedOutputsSelectorContext = createContext<RuleBasedOutputsSelectorDependencies>({
  use3dModels,
  useAssetsByIdsQuery,
  useAssetMappedNodesForRevisions,
  useMappedEdgesForRevisions,
  useAll3dDirectConnectionsWithProperties,
  useGetDMConnectionWithNodeFromHybridMappingsQuery,
  generateRuleBasedOutputs
});
