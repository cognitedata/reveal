import {
  AnnotationBoundingBox,
  AnnotationResourceType,
} from '@cognite/annotations';
import {
  AnnotatedResourceType,
  AnnotationCreate,
  AnnotationModel,
  CogniteClient,
  FileInfo,
} from '@cognite/sdk';
import {
  AnnotationSource,
  PnidResponseEntity,
  TaggedAnnotation,
} from 'modules/types';
import { hasOwnProperty } from './utils';

const CURRENT_VERSION_SEM_VER = '1.0.0';

const listAnnotationsFromAnnotationsApi = async (
  client: CogniteClient,
  resourceIds: number[],
  resourceType: AnnotatedResourceType
) => {
  return client.annotations
    .list({
      filter: {
        annotatedResourceType: resourceType,
        annotatedResourceIds: resourceIds.map((id) => ({ id })),
      },
      limit: 1000,
    })
    .autoPagingToArray({ limit: Infinity });
};

export const listAnnotationsForFileFromAnnotationsApi = async (
  client: CogniteClient,
  fileId: number
) => {
  return listAnnotationsFromAnnotationsApi(client, [fileId], 'file');
};

const findSimilarMatches = (
  taggedAnnotations: TaggedAnnotation[],
  box: AnnotationBoundingBox,
  resourceType: AnnotationResourceType,
  resourceExternalId?: string,
  resourceId?: number,
  threshold = 0.3
) => {
  return taggedAnnotations.some((taggedAnnotation) => {
    if (
      taggedAnnotation.source === AnnotationSource.EVENTS &&
      (taggedAnnotation.annotation.resourceExternalId === resourceExternalId ||
        taggedAnnotation.annotation.resourceId === resourceId) &&
      taggedAnnotation.annotation.resourceType === resourceType
    ) {
      return isSimilarBoundingBox(
        taggedAnnotation.annotation.box,
        box,
        threshold
      );
    }

    if (taggedAnnotation.source === AnnotationSource.ANNOTATIONS) {
      if (
        resourceType === 'file' &&
        taggedAnnotation.annotation.annotationType === 'diagrams.FileLink' &&
        // @ts-expect-error
        (taggedAnnotation.annotation.data.fileRef.id === resourceId ||
          // @ts-expect-error
          taggedAnnotation.annotation.data.fileRef.externalId ===
            resourceExternalId)
      ) {
        return isSimilarBoundingBox(
          // @ts-expect-error
          taggedAnnotation.annotation.data.textRegion,
          box,
          threshold
        );
      }

      if (
        resourceType === 'asset' &&
        taggedAnnotation.annotation.annotationType === 'diagrams.AssetLink' &&
        // @ts-expect-error
        (taggedAnnotation.annotation.data.assetRef.id === resourceId ||
          // @ts-expect-error
          taggedAnnotation.annotation.data.assetRef.externalId ===
            resourceExternalId)
      ) {
        return isSimilarBoundingBox(
          // @ts-expect-error
          taggedAnnotation.annotation.data.textRegion,
          box,
          threshold
        );
      }
    }

    return false;
  });
};

const getAnnotationPage = (annotation: AnnotationModel): number | undefined => {
  // Not possible to refine the AnnotationModel.data right now
  if (hasOwnProperty(annotation.data, 'pageNumber')) {
    return annotation.data.pageNumber as number | undefined;
  }

  return undefined;
};

export const createPendingAnnotationsFromJob = async (
  file: FileInfo,
  entities: PnidResponseEntity[],
  jobId: string,
  existingTaggedAnnotations: TaggedAnnotation[]
): Promise<AnnotationCreate[]> => {
  return entities.reduce((prev, entity) => {
    const activeEntities = existingTaggedAnnotations.filter(
      (taggedAnnotation) => {
        if (taggedAnnotation.source === AnnotationSource.EVENTS) {
          return (
            taggedAnnotation.annotation.page === entity.page &&
            taggedAnnotation.annotation.status !== 'deleted'
          );
        }

        return (
          taggedAnnotation.annotation.status !== 'rejected' &&
          getAnnotationPage(taggedAnnotation.annotation) === entity.page
        );
      }
    );

    const deletedEntities = existingTaggedAnnotations.filter(
      (taggedAnnotation) => {
        if (taggedAnnotation.source === AnnotationSource.EVENTS) {
          return (
            taggedAnnotation.annotation.page === entity.page &&
            taggedAnnotation.annotation.status === 'deleted'
          );
        }

        return (
          getAnnotationPage(taggedAnnotation.annotation) === entity.page &&
          taggedAnnotation.annotation.status === 'rejected'
        );
      }
    );

    entity.items.forEach((item) => {
      const resourceId = item.id;
      const resourceExternalId = item?.externalId;
      const { resourceType } = item;

      // if the same annotation has been "soft" deleted before, do not recreate.
      if (
        resourceType &&
        findSimilarMatches(
          deletedEntities,
          entity.boundingBox,
          resourceType,
          resourceExternalId,
          resourceId
        )
      ) {
        return;
      }
      // if the same annotation already exists, do not recreate.
      if (
        activeEntities.find((taggedAnnotation) => {
          if (taggedAnnotation.source === AnnotationSource.EVENTS) {
            return taggedAnnotation.annotation.resourceId === resourceId;
          }

          if (
            taggedAnnotation.annotation.annotationType === 'diagrams.FileLink'
          ) {
            return (
              // We can't refine the types right now
              // @ts-expect-error
              taggedAnnotation.annotation.data.fileRef.id === resourceId
            );
          }

          if (
            taggedAnnotation.annotation.annotationType === 'diagrams.AssetLink'
          ) {
            return (
              // We can't refine the types right now
              // @ts-expect-error
              taggedAnnotation.annotation.data.assetRef.id === resourceId
            );
          }

          // NOTE: This should never happen
          return false;
        })
      ) {
        return;
      }

      const sharedProperties: Pick<
        AnnotationModel,
        | 'annotatedResourceId'
        | 'annotatedResourceType'
        | 'creatingApp'
        | 'creatingUser'
        | 'creatingAppVersion'
        | 'status'
      > = {
        annotatedResourceId: file.id,
        annotatedResourceType: 'file',
        creatingApp: 'interactive-diagrams',
        creatingUser: `job:${jobId}`,
        creatingAppVersion: CURRENT_VERSION_SEM_VER,
        status: 'suggested',
      };

      if (item.resourceType === 'file') {
        prev.push({
          ...sharedProperties,
          annotationType: 'diagrams.FileLink',
          data: {
            fileRef:
              resourceId !== undefined
                ? {
                    id: resourceId,
                  }
                : { externalId: resourceExternalId },
            textRegion: entity.boundingBox,
            text: entity.text,
            pageNumber: entity.page,
          },
        });
        return;
      }

      if (item.resourceType === 'asset') {
        prev.push({
          ...sharedProperties,
          annotationType: 'diagrams.AssetLink',
          data: {
            assetRef:
              resourceId !== undefined
                ? {
                    id: resourceId,
                  }
                : { externalId: resourceExternalId },
            textRegion: entity.boundingBox,
            text: entity.text,
            pageNumber: entity.page,
          },
        });
        return;
      }

      throw new Error(
        `Only file and asset resource types are supported, type was ${item.resourceType}`
      );
    });
    return prev;
  }, [] as AnnotationCreate[]);
};

export const isSimilarBoundingBox = (
  origBox: AnnotationBoundingBox,
  compBox: AnnotationBoundingBox,
  percentDiff = 0.1,
  smallerOnly = false
) => {
  const { xMax, xMin, yMax, yMin } = origBox;
  // check right
  if (
    compBox.xMax <= (smallerOnly ? xMax : xMax * (1 + percentDiff)) &&
    compBox.xMax >= xMax * (1 - percentDiff)
  ) {
    // check bottom
    if (
      compBox.yMax <= (smallerOnly ? yMax : yMax * (1 + percentDiff)) &&
      compBox.yMax >= yMax * (1 - percentDiff)
    ) {
      // check left
      if (
        compBox.xMin >= (smallerOnly ? xMin : xMin * (1 - percentDiff)) &&
        compBox.xMin <= xMin * (1 + percentDiff)
      ) {
        // check top
        if (
          compBox.yMin >= (smallerOnly ? yMin : yMin * (1 - percentDiff)) &&
          compBox.yMin <= yMin * (1 + percentDiff)
        ) {
          return true;
        }
      }
    }
  }
  return false;
};
