import { createContext } from 'react';
import { useAssetMappedNodesForRevisions, useHybridAssetMappings, useMappedEdgesForRevisions } from './cad';

export type AssetMappingsDependencies = {
  useAssetMappedNodesForRevisions: typeof useAssetMappedNodesForRevisions;
  useMappedEdgesForRevisions: typeof useMappedEdgesForRevisions;
  useHybridAssetMappings: typeof useHybridAssetMappings;
};

export const AssetMappingsContext =
  createContext<AssetMappingsDependencies>({
    useAssetMappedNodesForRevisions,
    useMappedEdgesForRevisions,
    useHybridAssetMappings
  });
