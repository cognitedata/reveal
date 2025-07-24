import { type CogniteClient, type FilterDefinition, type ViewDefinition } from '@cognite/sdk';
import { type NodeItem } from '../../data-providers';
import {
  isClassicIdentifier,
  type TaggedAddResourceOptions
} from '../../components/Reveal3DResources';
import { searchHybridDmAssetsForCadModels } from './cad/searchHybridDmAssetsForCadModels';
import { type ClassicCadAssetMappingCache } from '../../components/CacheProvider/cad/ClassicCadAssetMappingCache';

export type SearchSort = {
  property: string[];
  direction: 'ascending' | 'descending';
};

export type DMSView = {
  rawView: ViewDefinition;
};

export async function searchHybridDmAssetsForModels(
  resources: TaggedAddResourceOptions[],
  view: DMSView,
  options: {
    query?: string;
    filter?: FilterDefinition;
    limit?: number;
  },
  sdk: CogniteClient,
  classicCadCache: ClassicCadAssetMappingCache
): Promise<NodeItem[]> {
  const rawView = view.rawView;

  const cadResources = resources
    .filter((resource) => resource.type === 'cad')
    .map((resource) => resource.addOptions)
    .filter(isClassicIdentifier);

  return await searchHybridDmAssetsForCadModels(
    cadResources,
    rawView,
    options,
    sdk,
    classicCadCache
  );
}
