import { type CogniteClient, type ListResponse } from '@cognite/sdk';
import { type CursorForModel } from './fetchAllAssetsForCadModels';
import { type ModelRevisionId } from '../../../components/CacheProvider/types';
import { chunk } from 'lodash';
import { isSameModel } from '../../../utilities/isSameModel';
import {
  convertToHybridAssetMapping,
  type RawCdfHybridClassicCadAssetMapping,
  type RawCdfHybridDmCadAssetMapping
} from '../../../components/CacheProvider/cad/rawAssetMappingTypes';
import { isDefined } from '../../../utilities/isDefined';
import {
  type ClassicCadAssetMapping,
  type DmCadAssetMapping
} from '../../../components/CacheProvider/cad/assetMappingTypes';

const MODEL_CHUNK_SIZE = 10;

export type HybridDataType = 'dm' | 'classic';

export type RawHybridAssetMapping<T extends HybridDataType = HybridDataType> = T extends 'dm'
  ? RawCdfHybridDmCadAssetMapping
  : RawCdfHybridClassicCadAssetMapping;

export type HybridAssetMapping<T extends HybridDataType> = T extends 'dm'
  ? DmCadAssetMapping
  : ClassicCadAssetMapping;

export type HybridAssetMappingsWithModel<T extends HybridDataType> = {
  mappings: ListResponse<Array<HybridAssetMapping<T>>>;
  model: ModelRevisionId;
};

export type HybridMappingsPerModelWithCursors<T extends HybridDataType> = {
  items: Array<HybridAssetMappingsWithModel<T>>;
  nextCursors: CursorForModel[];
};

export async function fetchHybridAssetMappingsForModels<T extends HybridDataType>(
  dataType: T,
  models: ModelRevisionId[],
  limit: number,
  cursorsForModels: CursorForModel[] | undefined,
  sdk: CogniteClient
): Promise<HybridMappingsPerModelWithCursors<T>> {
  const firstPage = cursorsForModels === undefined;

  const currentPagesOfAssetMappings: Array<HybridAssetMappingsWithModel<T>> = [];

  for (const modelChunk of chunk(models, MODEL_CHUNK_SIZE)) {
    const modelChunkAssetMappingPromises = modelChunk.map(
      async (model) =>
        await fetchAssetMappingsForModel(dataType, model, cursorsForModels, firstPage, limit, sdk)
    );

    const modelChunkAssetMappings = await Promise.all(modelChunkAssetMappingPromises);

    currentPagesOfAssetMappings.push(...modelChunkAssetMappings);
  }

  return {
    items: currentPagesOfAssetMappings,
    nextCursors: getNextCursors(currentPagesOfAssetMappings)
  };
}

function getNextCursors<T extends HybridDataType>(
  lastPage: Array<HybridAssetMappingsWithModel<T>>
): CursorForModel[] {
  return lastPage
    .map(({ mappings, model }) => ({ cursor: mappings.nextCursor, model }))
    .filter((mappingModel) => mappingModel.cursor !== undefined);
}

async function fetchAssetMappingsForModel<T extends HybridDataType>(
  dataType: T,
  model: ModelRevisionId,
  cursorsForModels: CursorForModel[] | undefined,
  isFirstPage: boolean,
  limit: number,
  sdk: CogniteClient
): Promise<HybridAssetMappingsWithModel<T>> {
  const cursorForModel = cursorsForModels?.find((nextCursor) =>
    isSameModel(nextCursor.model, model)
  )?.cursor;

  if (!isFirstPage && cursorForModel === undefined) {
    return { mappings: { items: [] }, model };
  }

  // TODO(BND3D-5844): enable using the Asset mapping cache here by implementing cursoring in the cache
  const mappings = (await sdk.assetMappings3D.list(model.modelId, model.revisionId, {
    cursor: cursorForModel,
    limit,
    getDmsInstances: dataType === 'dm'
  })) as ListResponse<Array<RawHybridAssetMapping<T>>>;

  const transformedMappings = mappings.items.map(convertToHybridAssetMapping).filter(isDefined);

  return {
    mappings: {
      items: transformedMappings as Array<HybridAssetMapping<T>>,
      nextCursor: mappings.nextCursor
    },
    model
  };
}
