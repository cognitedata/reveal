import {
  isTaggedAnnotationsApiAnnotation,
  isTaggedEventAnnotation,
  TaggedAnnotation,
} from '../modules/workflows';

type FileAssetIdsMap = {
  id?: number;
  externalId?: string;
  assetIds: Set<number>;
  assetExternalIds: Set<string>;
};

const getAssetIdsFromTaggedAnnotations = (
  taggedAnnotations: TaggedAnnotation[]
) => {
  return taggedAnnotations.reduce<FileAssetIdsMap[]>(
    (acc, taggedAnnotation) => {
      // NOTE: This is inlined and extended from @cognite/annotations
      // https://github.com/cognitedata/cognite-annotations/blob/0d22f229a3e5caac92916abc6f0450135e00de43/typescript/src/ContextAnnotationUtils.ts#L52
      if (
        isTaggedEventAnnotation(taggedAnnotation) &&
        taggedAnnotation.annotation.resourceType === 'asset'
      ) {
        let currentEdit = acc.find(
          (change) =>
            change.id === taggedAnnotation.annotation.fileId ||
            change.externalId === taggedAnnotation.annotation.fileExternalId
        );
        if (!currentEdit) {
          // if none for current file, then just add a new one for fileId / fileExternalId
          currentEdit = {
            id: taggedAnnotation.annotation.fileId,
            externalId: taggedAnnotation.annotation.fileExternalId,
            assetIds: new Set<number>(),
            assetExternalIds: new Set<string>(),
          };
          acc.push(currentEdit);
        }
        if (taggedAnnotation.annotation.resourceId) {
          currentEdit.assetIds.add(taggedAnnotation.annotation.resourceId);
        }
        if (taggedAnnotation.annotation.resourceExternalId) {
          currentEdit.assetExternalIds.add(
            taggedAnnotation.annotation.resourceExternalId
          );
        }
        return acc;
      }

      if (
        isTaggedAnnotationsApiAnnotation(taggedAnnotation) &&
        taggedAnnotation.annotation.annotationType === 'diagrams.AssetLink'
      ) {
        let currentEdit = acc.find(
          (change) =>
            // Note: Notable difference compared to event annotations is that Annotations API
            // only exposes the internal file id for the annotated resource (the file being annotated)
            change.id === taggedAnnotation.annotation.annotatedResourceId
        );
        if (!currentEdit) {
          // if none for current file, then just add a new one for fileId / fileExternalId
          currentEdit = {
            id: taggedAnnotation.annotation.annotatedResourceId,
            externalId: undefined,
            assetIds: new Set<number>(),
            assetExternalIds: new Set<string>(),
          };
          acc.push(currentEdit);
        }
        // @ts-expect-error
        if (taggedAnnotation.annotation.data.assetRef.id) {
          // @ts-expect-error
          currentEdit.assetIds.add(taggedAnnotation.annotation.assetRef.id);
        }

        // @ts-expect-error
        if (taggedAnnotation.annotation.data.assetRef.externalId) {
          currentEdit.assetExternalIds.add(
            // @ts-expect-error
            taggedAnnotation.annotation.assetRef.externalId
          );
        }

        return acc;
      }

      return acc;
    },
    []
  );
};

export default getAssetIdsFromTaggedAnnotations;
