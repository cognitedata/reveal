import { Image360AnnotationFilterOptions, ImageAssetLinkAnnotationInfo } from '@cognite/reveal';
import {
  AnnotationFilterProps,
  AnnotationModel,
  Asset,
  CogniteClient,
  FileFilterProps,
  IdEither
} from '@cognite/sdk';
import { ClassicImage360AnnotationMappedData } from '../../hooks';
import {
  createInstanceReferenceKey,
  isIdEither,
  isSameIdEither
} from '../../utilities/instanceIds';
import { isDefined } from '../../utilities/isDefined';
import { chunk, uniqBy } from 'lodash';
import { fetchAssetsForAssetIds } from '../../components/CacheProvider/AnnotationModelUtils';
import { isClassicImage360AssetAnnotationData } from '../../utilities/image360Annotations';

export async function getClassicAssetMapped360Annotations(
  siteIds: string[],
  sdk: CogniteClient,
  image360AnnotationFilterOptions: Image360AnnotationFilterOptions
): Promise<ClassicImage360AnnotationMappedData[]> {
  const fileIdsList = await get360ImagesFileIds(siteIds, sdk);
  const image360Annotations = await get360ImageAnnotations(
    fileIdsList,
    sdk,
    image360AnnotationFilterOptions
  );
  return await get360AnnotationAssets(image360Annotations, sdk);
}

async function get360AnnotationAssets(
  image360Annotations: AnnotationModel[],
  sdk: CogniteClient
): Promise<ClassicImage360AnnotationMappedData[]> {
  const filteredAnnotationMappings = image360Annotations
    .map((annotation) => {
      const assetReference = (annotation as ImageAssetLinkAnnotationInfo).data.assetRef;

      if (!isIdEither(assetReference)) {
        return undefined;
      }

      return {
        assetReference,
        annotationId: annotation.id
      };
    })
    .filter(isDefined);

  const uniqueAnnotationMapping = uniqBy(filteredAnnotationMappings, (mapping) =>
    createInstanceReferenceKey(mapping.assetReference)
  );

  const assets = await fetchAssetsForAssetIds(
    uniqueAnnotationMapping.map((mapping) => mapping.assetReference),
    sdk
  );

  return getAssetsWithAnnotations(assets, filteredAnnotationMappings);
}

function getAssetsWithAnnotations(
  flatAssets: Asset[],
  annotationMapping: Array<{ assetReference: IdEither; annotationId: number }>
): Array<{ asset: Asset; annotationIds: number[] }> {
  const flatAssetsWithAnnotations: Array<{ asset: Asset; annotationIds: number[] }> = [];

  flatAssets.forEach((asset) => {
    const matchingMapping = annotationMapping.find((mapping) => {
      return isSameIdEither(mapping.assetReference, asset);
    });

    if (matchingMapping !== undefined) {
      const matchedAssetWithAnnotation = flatAssetsWithAnnotations.find(
        (entry) => entry.asset.id === asset.id
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
  const fileIdListPromises = siteIds.map(async (siteId) => {
    const req: FileFilterProps = {
      metadata: { site_id: siteId }
    };
    const fileIds = await listFileIds(req, sdk);
    return fileIds;
  });

  const fileIdsList = (await Promise.all(fileIdListPromises)).flat();

  return fileIdsList;
}

async function get360ImageAnnotations(
  fileIdsList: number[],
  sdk: CogniteClient,
  image360AnnotationFilterOptions: Image360AnnotationFilterOptions
): Promise<AnnotationModel[]> {
  const annotationArray = await Promise.all(
    chunk(fileIdsList, 1000).map(async (fileIdsChunk) => {
      const filter: AnnotationFilterProps = {
        annotatedResourceIds: fileIdsChunk.map((id) => ({ id })),
        annotatedResourceType: 'file',
        annotationType: 'images.AssetLink'
      };
      const annotations = await sdk.annotations
        .list({
          filter,
          limit: 1000
        })
        .autoPagingToArray({ limit: Infinity });

      const filteredAnnotations = annotations
        .filter(
          (annotation) =>
            annotation.status === image360AnnotationFilterOptions.status ||
            image360AnnotationFilterOptions.status === 'all'
        )
        .filter((annotation) => isClassicImage360AssetAnnotationData(annotation.data));
      return filteredAnnotations;
    })
  );

  return annotationArray.flatMap((annotations) => annotations);
}

async function listFileIds(filter: FileFilterProps, sdk: CogniteClient): Promise<number[]> {
  const req = { filter, limit: 1000 };
  const map = await sdk.files.list(req).autoPagingToArray({ limit: Infinity });

  const fileInfo = await Promise.all(map.flat());
  const list = fileInfo.map((file) => file.id);

  return list;
}
