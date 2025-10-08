import { type CogniteClient, type FilterDefinition, type ViewDefinition } from '@cognite/sdk';
import { type ClassicAdd3DModelOptions } from '../../../components/Reveal3DResources/types';
import { searchHybridDmCadAssetMappingsWithFilters } from './searchHybridDmCadAssetMappingsWithFilters';
import { type NodeItem } from '../../../data-providers';
import { fetchHybridAssetMappingsForModels } from './fetchHybridAssetMappingsForModels';
import { FdmSDK } from '../../../data-providers/FdmSDK';
import { restrictToViewReference } from '../../../utilities/restrictToViewReference';
import { type ClassicCadAssetMappingCache } from '../../../components/CacheProvider/cad/ClassicCadAssetMappingCache';

export async function searchHybridDmAssetsForCadModels(
  models: ClassicAdd3DModelOptions[],
  view: ViewDefinition,
  options: {
    query?: string;
    filter?: FilterDefinition;
    limit?: number;
  },
  sdk: CogniteClient,
  classicCadCache: ClassicCadAssetMappingCache
): Promise<NodeItem[]> {
  if ((options.query === undefined || options.query === '') && options.filter === undefined) {
    return await fetchHybridDmAssetsForCadModels(models, options.limit ?? 1000, view, sdk);
  }

  return await searchHybridDmCadAssetMappingsWithFilters(
    models,
    options,
    view,
    sdk,
    classicCadCache
  );
}

async function fetchHybridDmAssetsForCadModels(
  models: ClassicAdd3DModelOptions[],
  limit: number,
  view: ViewDefinition,
  sdk: CogniteClient
): Promise<NodeItem[]> {
  const assetMappingsPerModel = await fetchHybridAssetMappingsForModels<'dm'>(
    'dm',
    models,
    limit,
    undefined,
    sdk
  );

  const fdmSdk = new FdmSDK(sdk);

  const instanceIds = assetMappingsPerModel.items.flatMap((mappingsForModel) =>
    mappingsForModel.mappings.items.map((mapping) => mapping.instanceId)
  );
  const dmsInstances = await fdmSdk.getByExternalIds(
    instanceIds.map((mapping) => ({ ...mapping, instanceType: 'node' })),
    [restrictToViewReference(view)]
  );

  return dmsInstances.items as NodeItem[];
}
