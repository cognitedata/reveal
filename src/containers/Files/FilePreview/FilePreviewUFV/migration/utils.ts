import {
  AnnotationStatus as EventAnnotationStatus,
  CogniteAnnotation,
} from '@cognite/annotations';
import { AnnotationModel } from '@cognite/sdk';
import { pickBy } from 'lodash';
import { AnnotationStatus } from '@cognite/sdk';
import {
  ResourceItem,
  ResourceItemState,
  ResourceType,
} from '../../../../../types';
import {
  ANNOTATION_SOURCE_KEY,
  AnnotationSource,
  ExtendedAnnotation,
  TaggedAnnotation,
  TaggedAnnotationAnnotation,
  TaggedEventAnnotation,
  TaggedLocalAnnotation,
} from '../types';

export const getExtendedAnnotationPage = (
  annotation: ExtendedAnnotation
): number | undefined => {
  if (isExtendedEventAnnotation(annotation)) {
    return annotation.metadata.page;
  }

  if (
    isExtendedAnnotationAnnotation(annotation) ||
    isExtendedLocalAnnotation(annotation)
  ) {
    // @ts-expect-error
    return annotation.metadata.data.pageNumber;
  }

  throw new Error('Unsupported annotation source');
};

export const getExtendedAnnotationDescription = (
  annotation: ExtendedAnnotation
): string | undefined => {
  if (isExtendedEventAnnotation(annotation)) {
    return annotation.metadata.description;
  }

  if (
    isExtendedAnnotationAnnotation(annotation) ||
    isExtendedLocalAnnotation(annotation)
  ) {
    // @ts-expect-error
    return annotation.metadata.data.description;
  }

  throw new Error('Unsupported annotation source');
};

export const isExtendedLocalAnnotation = (
  annotation: ExtendedAnnotation
): annotation is ExtendedAnnotation<TaggedLocalAnnotation> =>
  annotation.metadata[ANNOTATION_SOURCE_KEY] === AnnotationSource.LOCAL;

export const isExtendedEventAnnotation = (
  annotation: ExtendedAnnotation
): annotation is ExtendedAnnotation<TaggedEventAnnotation> =>
  annotation.metadata[ANNOTATION_SOURCE_KEY] === AnnotationSource.EVENTS;

export const isExtendedAnnotationAnnotation = (
  annotation: ExtendedAnnotation
): annotation is ExtendedAnnotation<TaggedAnnotationAnnotation> =>
  annotation.metadata[ANNOTATION_SOURCE_KEY] === AnnotationSource.ANNOTATIONS;

export const getResourceIdFromTaggedAnnotation = (
  annotation: TaggedAnnotation
) => {
  if (isTaggedEventAnnotation(annotation)) {
    return annotation.resourceId;
  }

  if (
    isTaggedAnnotationAnnotation(annotation) ||
    isTaggedLocalAnnotation(annotation)
  ) {
    if (annotation.annotationType === 'diagrams.AssetLink') {
      // @ts-expect-error
      return annotation.data.assetRef.id;
    }

    if (annotation.annotationType === 'diagrams.FileLink') {
      // @ts-expect-error
      return annotation.data.fileRef.id;
    }

    return undefined;
  }
};

export const getResourceIdFromExtendedAnnotation = (
  annotation: ExtendedAnnotation
): number | undefined => {
  return getResourceIdFromTaggedAnnotation(annotation.metadata);
};

export const mapAnnotationStatusToEventAnnotationStatus = (
  status: AnnotationStatus
): EventAnnotationStatus => {
  if (status === 'approved') {
    return 'verified';
  }

  if (status === 'rejected') {
    return 'deleted';
  }

  if (status === 'suggested') {
    return 'unhandled';
  }

  throw new Error(`Unsupported annotation status: ${status}`);
};

export const setExtendedAnnotationStatus = (
  annotation: ExtendedAnnotation,
  status: AnnotationStatus
) => {
  if (isExtendedEventAnnotation(annotation)) {
    return {
      ...annotation,
      metadata: {
        ...annotation.metadata,
        status: mapAnnotationStatusToEventAnnotationStatus(status),
      },
    };
  }

  if (isExtendedAnnotationAnnotation(annotation)) {
    return {
      ...annotation,
      metadata: {
        ...annotation.metadata,
        status,
      },
    };
  }

  throw new Error(
    `Unsupported annotation source: ${annotation.metadata[ANNOTATION_SOURCE_KEY]}`
  );
};

export const setExtendedAnnotationResource = (
  annotation: ExtendedAnnotation,
  resource: ResourceItem
): ExtendedAnnotation => {
  if (resource.type !== 'asset' && resource.type !== 'file') {
    return annotation;
  }

  if (isExtendedEventAnnotation(annotation)) {
    return {
      ...annotation,
      metadata: {
        ...annotation.metadata,
        resourceType: resource.type,
        resourceId: resource.id,
        resourceExternalId: resource.externalId,
      },
    };
  }

  // NOTE: we're (ab-)using the fact that we currently only can switch
  // between file links and asset links, and that the only difference
  // between them is that one of them contains a fileRef while the other
  // contains an assetRef. This should be fixed by refactoring
  // the SDK so that the annotations are more strictly typed.
  if (
    isExtendedAnnotationAnnotation(annotation) ||
    isExtendedLocalAnnotation(annotation)
  ) {
    if (resource.type === 'asset') {
      const annotationData = pickBy(
        annotation.metadata.data,
        (value, key) => key !== 'fileRef'
      );
      return {
        ...annotation,
        metadata: {
          ...annotation.metadata,
          annotationType: 'diagrams.AssetLink',
          // @ts-expect-error
          data: {
            ...annotationData,
            assetRef: {
              // @ts-expect-error
              ...annotationData.assetRef,
              id: resource.id,
              externalId: resource.externalId,
            },
          },
        },
      };
    }

    if (resource.type === 'file') {
      const annotationData = pickBy(
        annotation.metadata.data,
        (value, key) => key !== 'assetRef'
      );
      return {
        ...annotation,
        metadata: {
          ...annotation.metadata,
          annotationType: 'diagrams.FileLink',
          // @ts-expect-error
          data: {
            ...annotationData,
            fileRef: {
              // @ts-expect-error
              ...annotationData.fileRef,
              id: resource.id,
              externalId: resource.externalId,
            },
          },
        },
      };
    }
  }

  return annotation;
};

export const getExtendedAnnotationLabel = (
  annotation: ExtendedAnnotation
): string => {
  if (isExtendedEventAnnotation(annotation)) {
    return annotation.metadata.label ?? '';
  }

  if (
    isExtendedAnnotationAnnotation(annotation) ||
    isExtendedLocalAnnotation(annotation)
  ) {
    // @ts-expect-error
    return annotation.metadata.data.text ?? '';
  }

  return '';
};

export const setExtendedAnnotationLabel = (
  annotation: ExtendedAnnotation,
  label: string
): ExtendedAnnotation => {
  if (isExtendedEventAnnotation(annotation)) {
    return {
      ...annotation,
      metadata: {
        ...annotation.metadata,
        label,
      },
    };
  }

  if (isExtendedAnnotationAnnotation(annotation)) {
    return {
      ...annotation,
      metadata: {
        ...annotation.metadata,
        data: {
          ...annotation.metadata.data,
          text: label,
        },
      },
    };
  }

  if (isExtendedLocalAnnotation(annotation)) {
    return {
      ...annotation,
      metadata: {
        ...annotation.metadata,
        data: {
          ...annotation.metadata.data,
          text: label,
        },
      },
    };
  }

  return annotation;
};

export const setExtendedAnnotationDescription = (
  annotation: ExtendedAnnotation,
  description: string
): ExtendedAnnotation => {
  if (isExtendedEventAnnotation(annotation)) {
    return {
      ...annotation,
      metadata: {
        ...annotation.metadata,
        description,
      },
    };
  }

  if (isExtendedAnnotationAnnotation(annotation)) {
    return {
      ...annotation,
      metadata: {
        ...annotation.metadata,
        data: {
          ...annotation.metadata.data,
          description,
        },
      },
    };
  }

  if (isExtendedLocalAnnotation(annotation)) {
    return {
      ...annotation,
      metadata: {
        ...annotation.metadata,
        data: {
          ...annotation.metadata.data,
          description,
        },
      },
    };
  }

  return annotation;
};

export const getFileIdFromExtendedAnnotation = (
  annotation: ExtendedAnnotation
): number | undefined => {
  if (isExtendedEventAnnotation(annotation)) {
    return annotation.metadata.fileId;
  }

  if (
    isExtendedAnnotationAnnotation(annotation) ||
    isExtendedLocalAnnotation(annotation)
  ) {
    if (annotation.metadata.annotatedResourceType === 'file') {
      return annotation.metadata.annotatedResourceId;
    }
    return undefined;
  }

  return undefined;
};

export const getFileExternalIdFromExtendedAnnotation = (
  annotation: ExtendedAnnotation
): string | undefined => {
  if (isExtendedEventAnnotation(annotation)) {
    return annotation.metadata.fileExternalId;
  }

  if (
    isExtendedAnnotationAnnotation(annotation) ||
    isExtendedLocalAnnotation(annotation)
  ) {
    return undefined;
  }

  return undefined;
};

export const getResourceExternalIdFromTaggedAnnotation = (
  taggedAnnotation: TaggedAnnotation
) => {
  if (isTaggedEventAnnotation(taggedAnnotation)) {
    return taggedAnnotation.resourceExternalId;
  }

  if (
    isTaggedAnnotationAnnotation(taggedAnnotation) ||
    isTaggedLocalAnnotation(taggedAnnotation)
  ) {
    if (taggedAnnotation.annotationType === 'diagrams.AssetLink') {
      // @ts-expect-error
      return taggedAnnotation.data.assetRef.externalId;
    }

    if (taggedAnnotation.annotationType === 'diagrams.FileLink') {
      // @ts-expect-error
      return taggedAnnotation.data.fileRef.externalId;
    }

    return undefined;
  }

  return undefined;
};

export const getResourceExternalIdFromExtendedAnnotation = (
  annotation: ExtendedAnnotation
) => {
  return getResourceExternalIdFromTaggedAnnotation(annotation.metadata);
};

export const getResourceTypeFromTaggedAnnotation = (
  taggedAnnotation: TaggedAnnotation
): ResourceType | undefined => {
  if (isTaggedEventAnnotation(taggedAnnotation)) {
    if (
      taggedAnnotation.resourceType === 'asset' ||
      taggedAnnotation.resourceType === 'file'
    ) {
      return taggedAnnotation.resourceType;
    }

    return undefined;
  }

  if (
    isTaggedAnnotationAnnotation(taggedAnnotation) ||
    isTaggedLocalAnnotation(taggedAnnotation)
  ) {
    if (taggedAnnotation.annotationType === 'diagrams.AssetLink') {
      return 'asset';
    }

    if (taggedAnnotation.annotationType === 'diagrams.FileLink') {
      return 'file';
    }

    return undefined;
  }

  return undefined;
};

export const getResourceTypeFromExtendedAnnotation = (
  annotation: ExtendedAnnotation
) => {
  return getResourceTypeFromTaggedAnnotation(annotation.metadata);
};

export const getResourceItemStateFromExtendedAnnotation = (
  annotation: ExtendedAnnotation,
  state: ResourceItemState['state']
): ResourceItemState | undefined => {
  const id = getResourceIdFromExtendedAnnotation(annotation);
  const type = getResourceTypeFromExtendedAnnotation(annotation);

  if (id === undefined || type === undefined) {
    return undefined;
  }

  return {
    id,
    type,
    state,
  };
};

export const isApprovedTaggedAnnotation = (annotation: TaggedAnnotation) => {
  if (isTaggedEventAnnotation(annotation)) {
    return annotation.status === 'verified';
  }

  if (isTaggedAnnotationAnnotation(annotation)) {
    return annotation.status === 'approved';
  }

  return false;
};

export const isSuggestedTaggedAnnotation = (annotation: TaggedAnnotation) => {
  if (isTaggedEventAnnotation(annotation)) {
    return annotation.status === 'unhandled';
  }

  if (isTaggedAnnotationAnnotation(annotation)) {
    return annotation.status === 'suggested';
  }

  return false;
};

export const isApprovedAnnotation = (annotation: ExtendedAnnotation) => {
  return isApprovedTaggedAnnotation(annotation.metadata);
};

export const isSuggestedAnnotation = (annotation: ExtendedAnnotation) => {
  return isSuggestedTaggedAnnotation(annotation.metadata);
};

export const isAssetAnnotation = (annotation: ExtendedAnnotation) => {
  if (isExtendedEventAnnotation(annotation)) {
    return annotation.metadata.resourceType === 'asset';
  }

  if (
    isExtendedAnnotationAnnotation(annotation) ||
    isExtendedLocalAnnotation(annotation)
  ) {
    return annotation.metadata.annotationType === 'diagrams.AssetLink';
  }

  return false;
};

export const isFileAnnotation = (annotation: ExtendedAnnotation) => {
  if (isExtendedEventAnnotation(annotation)) {
    return annotation.metadata.resourceType === 'file';
  }

  if (
    isExtendedAnnotationAnnotation(annotation) ||
    isExtendedLocalAnnotation(annotation)
  ) {
    return annotation.metadata.annotationType === 'diagrams.FileLink';
  }

  return false;
};

export const getTaggedEventAnnotation = (
  annotation: CogniteAnnotation
): TaggedEventAnnotation => {
  return {
    ...annotation,
    [ANNOTATION_SOURCE_KEY]: AnnotationSource.EVENTS,
  };
};

export const getTaggedAnnotationAnnotation = (
  annotation: AnnotationModel
): TaggedAnnotationAnnotation => {
  return {
    ...annotation,
    [ANNOTATION_SOURCE_KEY]: AnnotationSource.ANNOTATIONS,
  };
};

export const isTaggedEventAnnotation = (
  taggedAnnotation: TaggedAnnotation
): taggedAnnotation is TaggedEventAnnotation => {
  return taggedAnnotation[ANNOTATION_SOURCE_KEY] === AnnotationSource.EVENTS;
};

export const isTaggedAnnotationAnnotation = (
  taggedAnnotation: TaggedAnnotation
): taggedAnnotation is TaggedAnnotationAnnotation => {
  return (
    taggedAnnotation[ANNOTATION_SOURCE_KEY] === AnnotationSource.ANNOTATIONS
  );
};

export const isTaggedLocalAnnotation = (
  taggedAnnotation: TaggedAnnotation
): taggedAnnotation is TaggedLocalAnnotation => {
  return taggedAnnotation[ANNOTATION_SOURCE_KEY] === AnnotationSource.LOCAL;
};
