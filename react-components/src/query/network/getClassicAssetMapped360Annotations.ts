import { type Image360AnnotationFilterOptions } from '@cognite/reveal';
import {
  type AnnotationFilterProps,
  type AnnotationModel,
  type CogniteClient,
  type FileFilterProps
} from '@cognite/sdk';
import { type Image360AnnotationMappedData } from '../../hooks';
import {
  createInstanceReferenceKey,
  isDmsInstance,
  isIdEither,
  isSameAssetReference
} from '../../utilities/instanceIds';
import { isDefined } from '../../utilities/isDefined';
import { chunk, uniqBy } from 'lodash-es';
import {
  isClassicImage360AssetAnnotationData,
  isHybridImage360AssetAnnotationData
} from '../../utilities/image360Annotations';
import { getAssetsForIds } from './common/getAssetsForIds';
import { type AllAssetFilterProps } from './common/filters';
import { type ClassicAnnotationIdAndAssetReference } from './types';
import { type AssetInstance } from '../../utilities/instances';
import { getDMAssetsForAnnotationReference } from './common/getDMAssetsForAnnotationReference';

const MAX_PARALLEL_ANNOTATION_QUERIES = 5;
const MAX_PARALLEL_FILES_QUERIES = 5;

export async function getClassicAssetMapped360Annotations(
  siteIds: string[],
  filterOptions: {
    assetFilters?: AllAssetFilterProps | undefined;
    image360AnnotationFilterOptions: Image360AnnotationFilterOptions;
  },
  sdk: CogniteClient
): Promise<Image360AnnotationMappedData[]> {
  const fileIdsList = await get360ImagesFileIds(siteIds, sdk);
  const image360Annotations = await get360ImageAnnotations(
    fileIdsList,
    sdk,
    filterOptions.image360AnnotationFilterOptions
  );
  return await get360AnnotationAssets(image360Annotations, filterOptions.assetFilters, sdk);
}

async function get360AnnotationAssets(
  image360Annotations: AnnotationModel[],
  filters: AllAssetFilterProps | undefined,
  sdk: CogniteClient
): Promise<Image360AnnotationMappedData[]> {
  const filteredAnnotationMappings = image360Annotations
    .map(getClassicOrHybridAssetReferenceFromAnnotation)
    .filter(isDefined);

  const uniqueAnnotationMapping = uniqBy(filteredAnnotationMappings, (mapping) =>
    createInstanceReferenceKey(mapping.assetReference)
  );

  const classicAssets = await getAssetsForIds(
    uniqueAnnotationMapping.map((mapping) => mapping.assetReference).filter(isIdEither),
    filters,
    sdk
  );

  const hybridAssets = await getDMAssetsForAnnotationReference(
    uniqueAnnotationMapping
      .map((mapping) => mapping.assetReference)
      .filter((assetReference) => !isIdEither(assetReference)),
    sdk
  );
  return getAssetsWithAnnotations([...classicAssets, ...hybridAssets], filteredAnnotationMappings);
}

function getClassicOrHybridAssetReferenceFromAnnotation(
  annotation: AnnotationModel
): ClassicAnnotationIdAndAssetReference | undefined {
  if (isClassicImage360AssetAnnotationData(annotation.data)) {
    const assetRef = annotation.data.assetRef;
    if (!isIdEither(assetRef)) {
      return undefined;
    }
    return {
      assetReference: assetRef,
      annotationId: annotation.id
    };
  }

  if (isHybridImage360AssetAnnotationData(annotation.data)) {
    const instanceRef = annotation.data.instanceRef;
    if (!isDmsInstance(instanceRef)) {
      return undefined;
    }
    return {
      assetReference: instanceRef,
      annotationId: annotation.id
    };
  }
  return undefined;
}

function getAssetsWithAnnotations(
  assets: AssetInstance[],
  annotationMapping: ClassicAnnotationIdAndAssetReference[]
): Array<{ asset: AssetInstance; annotationIds: number[] }> {
  const flatAssetsWithAnnotations: Array<{ asset: AssetInstance; annotationIds: number[] }> = [];

  assets.forEach((asset) => {
    const matchingMapping = annotationMapping.find((mapping) => {
      return isSameAssetReference(mapping.assetReference, asset);
    });

    if (matchingMapping !== undefined) {
      const matchedAssetWithAnnotation = flatAssetsWithAnnotations.find((entry) =>
        isSameAssetReference(entry.asset, asset)
      );

      if (matchedAssetWithAnnotation !== undefined) {
        matchedAssetWithAnnotation.annotationIds.push(matchingMapping.annotationId);
      } else {
        flatAssetsWithAnnotations.push({
          asset,
          annotationIds: [matchingMapping.annotationId]
        });
      }
    }
  });

  return flatAssetsWithAnnotations;
}

async function get360ImagesFileIds(siteIds: string[], sdk: CogniteClient): Promise<number[]> {
  const fileIdsResult: number[] = [];

  const siteIdChunks = chunk(siteIds, MAX_PARALLEL_FILES_QUERIES);

  for (const siteIdChunk of siteIdChunks) {
    const fileIdListPromises = siteIdChunk.map(async (siteId) => {
      const req: FileFilterProps = {
        metadata: { site_id: siteId }
      };
      const fileIds = await listFileIds(req, sdk);
      return fileIds;
    });

    const chunkFileIds = await Promise.all(fileIdListPromises);
    fileIdsResult.push(...chunkFileIds.flat());
  }

  return fileIdsResult;
}

async function get360ImageAnnotations(
  fileIdsList: number[],
  sdk: CogniteClient,
  image360AnnotationFilterOptions: Image360AnnotationFilterOptions
): Promise<AnnotationModel[]> {
  const fileIdChunks = chunk(fileIdsList, 1000);

  const annotationsResult: AnnotationModel[] = [];

  for (const fileIdChunkBatch of chunk(fileIdChunks, MAX_PARALLEL_ANNOTATION_QUERIES)) {
    const annotationChunkBatchPromises = fileIdChunkBatch.map(async (fileIdsChunk) => {
      const filter: AnnotationFilterProps = {
        annotatedResourceIds: fileIdsChunk.map((id) => ({ id })),
        annotatedResourceType: 'file'
      };
      const annotations = await sdk.annotations
        .list({
          filter,
          limit: 1000
        })
        .autoPagingToArray({ limit: Infinity });

      return annotations
        .filter(
          (annotation) =>
            annotation.status === image360AnnotationFilterOptions.status ||
            image360AnnotationFilterOptions.status === 'all'
        )
        .filter((annotation) => isClassicImage360AssetAnnotationData(annotation.data));
    });

    const chunkBatchAnnotationArrays = await Promise.all(annotationChunkBatchPromises);

    console.log('TEST Fetched annotations for 360 images:', chunkBatchAnnotationArrays);
    annotationsResult.push(...chunkBatchAnnotationArrays.flat());
  }

  return annotationsResult;
}

async function listFileIds(filter: FileFilterProps, sdk: CogniteClient): Promise<number[]> {
  const req = { filter, limit: 1000 };
  const fileInfos = await sdk.files.list(req).autoPagingToArray({ limit: Infinity });
  return fileInfos.map((file) => file.id);
}
