import { CogniteClient, FilterDefinition, ViewDefinition } from '@cognite/sdk';
import { ClassicAdd3DModelOptions } from '../../../components/Reveal3DResources/types';
import { RevealRenderTarget } from '../../../architecture';
import { searchHybridDmCadAssetMappingsWithFilters } from './searchHybridDmCadAssetMappingsWithFilters';
import { NodeItem } from '../../../data-providers';
import { fetchAllHybridAssetMappingsForModels } from './fetchAllHybridAssetMappingsForModels';
import { FdmSDK } from '../../../data-providers/FdmSDK';
import { restrictToDmsId } from '../../../utilities/restrictToDmsId';
import { restrictToViewReference } from '../../../utilities/restrictToViewReference';
import { ClassicCadAssetMappingCache } from '../../../components/CacheProvider/cad/ClassicCadAssetMappingCache';

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
    return await fetchAllHybridDmAssetsForCadModels(models, options.limit ?? 1000, view, sdk);
  }

  return await searchHybridDmCadAssetMappingsWithFilters(
    models,
    options,
    view,
    sdk,
    classicCadCache
  );
}

async function fetchAllHybridDmAssetsForCadModels(
  models: ClassicAdd3DModelOptions[],
  limit: number,
  view: ViewDefinition,
  sdk: CogniteClient
): Promise<NodeItem[]> {
  const assetMappingsPerModel = await fetchAllHybridAssetMappingsForModels<'dm'>(
    'dm',
    models,
    limit,
    undefined,
    sdk
  );

  // console.log('Asset mappings per model: ', assetMappingsPerModel.items[0].mappings);

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
