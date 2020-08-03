import { FilesMetadata, Asset } from '@cognite/sdk';
import { PnidResponseEntity } from 'modules/fileContextualization/parsingJobs';
import { stripWhitespace } from 'helpers/Helpers';
import {
  CogniteAnnotation,
  PendingCogniteAnnotation,
  AnnotationResourceType,
  CURRENT_VERSION,
  AnnotationBoundingBox,
} from '@cognite/annotations';

export const PNID_ANNOTATION_TYPE = 'pnid_annotation';

const assetNameToIdsMap = (assets: Asset[]) => {
  return assets.reduce((prev, asset) => {
    const key = stripWhitespace(asset.name);
    if (!prev[key]) {
      prev[key] = { id: [], externalId: [] };
    }
    prev[key].id.push(asset.id);
    if (asset.externalId) {
      prev[key].externalId.push(asset.externalId);
    }
    return prev;
  }, {} as { [key: string]: { id: number[]; externalId: string[] } });
};

const fileNameToIdsMap = (files: FilesMetadata[]) => {
  return files.reduce((prev, item) => {
    const key = stripWhitespace(removeExtension(item.name));
    if (!prev[key]) {
      prev[key] = { id: [], externalId: [] };
    }
    prev[key].id.push(item.id);
    if (item.externalId) {
      prev[key].externalId.push(item.externalId);
    }
    return prev;
  }, {} as { [key: string]: { id: number[]; externalId: string[] } });
};

const findSimilarMatches = (
  entities: CogniteAnnotation[],
  box: AnnotationBoundingBox,
  resourceType: AnnotationResourceType,
  resourceExternalId?: string,
  resourceId?: number,
  threshold = 0.3
) => {
  if (
    entities.some(entity => {
      if (
        (entity.resourceExternalId === resourceExternalId ||
          entity.resourceId === resourceId) &&
        entity.resourceType === resourceType
      ) {
        return isSimilarBoundingBox(entity.box, box, threshold);
      }
      return false;
    })
  ) {
    return true;
  }
  return false;
};

export const createPendingAnnotationsFromJob = async (
  file: FilesMetadata,
  entities: PnidResponseEntity[],
  refAssets: Asset[],
  refFiles: FilesMetadata[],
  jobId: string,
  existingEntities: CogniteAnnotation[]
): Promise<PendingCogniteAnnotation[]> => {
  const assetsMap = assetNameToIdsMap(refAssets);
  const filesMap = fileNameToIdsMap(refFiles);

  return entities.reduce((prev, entity) => {
    let resourceId: number | undefined;
    let resourceExternalId: string | undefined;
    let resourceType: AnnotationResourceType | undefined;
    const strippedEntityText = stripWhitespace(entity.text);

    // if found perfect asset match
    if (
      assetsMap[strippedEntityText] &&
      assetsMap[strippedEntityText].id.length === 1
    ) {
      resourceType = 'asset';
      if (assetsMap[strippedEntityText].externalId.length === 1) {
        [resourceExternalId] = assetsMap[strippedEntityText].externalId;
      } else {
        [resourceId] = assetsMap[strippedEntityText].id;
      }
    }

    // if found perfect file match
    if (
      filesMap[strippedEntityText] &&
      filesMap[strippedEntityText].id.length === 1
    ) {
      resourceType = 'file';
      if (filesMap[strippedEntityText].externalId.length === 1) {
        [resourceExternalId] = filesMap[strippedEntityText].externalId;
      } else {
        [resourceId] = filesMap[strippedEntityText].id;
      }
    }

    const activeEntities = existingEntities.filter(
      el => el.page === entity.page && el.status !== 'deleted'
    );

    const deletedEntities = existingEntities.filter(
      el => el.page === entity.page && el.status === 'deleted'
    );

    if (
      activeEntities.some(
        el =>
          // much smaller
          isSimilarBoundingBox(el.box, el.box, 1, true) ||
          // bigger or smaller by 20%
          isSimilarBoundingBox(el.box, el.box, 0.2, false)
      )
    ) {
      return prev;
    }

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
      return prev;
    }

    prev.push({
      box: entity.boundingBox,
      ...(!file.externalId ? { fileId: file.id } : {}),
      ...(file.externalId ? { fileExternalId: file.externalId } : {}),
      resourceId,
      resourceExternalId,
      resourceType,
      type: PNID_ANNOTATION_TYPE,
      label: entity.text,
      source: `job:${jobId}`,
      version: CURRENT_VERSION,
      owner: `${jobId}`,
      status: 'unhandled',
      page: entity.page,
    } as PendingCogniteAnnotation);
    return prev;
  }, [] as PendingCogniteAnnotation[]);
};

export const removeExtension = (name: string) => {
  const indexOfExtension = name.lastIndexOf('.');
  if (indexOfExtension !== -1) {
    return name.substring(0, indexOfExtension);
  }
  return name;
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
