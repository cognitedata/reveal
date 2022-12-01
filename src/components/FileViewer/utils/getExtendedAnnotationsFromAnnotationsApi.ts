import { AnnotationStatus } from '@cognite/annotations';
import {
  AnnotationType as UfvAnnotationType,
  getDefaultStylesByResourceType,
} from '@cognite/unified-file-viewer';
import {
  AnnotationModel,
  AnnotationStatus as AnnotationsApiStatus,
} from '../sdk/sdkTypes';
import { ExtendedAnnotation } from '../types';
import { getBoundingBoxFromAnnotationData, getRefResourceType } from './utils';

const SUPPORTED_TYPES = ['diagrams.AssetLink', 'diagrams.FileLink'];

// TODO(UFV-239): This is mostly taken from UFV. We will move this entire thing to UFV once it's validated

const mapAnnotationsApiStatusToCogniteAnnotationStatus = (
  status: AnnotationsApiStatus
): AnnotationStatus => {
  if (status === 'suggested') {
    return 'unhandled';
  }

  if (status === 'approved') {
    return 'verified';
  }

  if (status === 'rejected') {
    return 'deleted';
  }

  throw new Error(`Unsupported status: ${status}`);
};

const getSpecificMetadataFromAnnotationModel = (
  annotation: AnnotationModel
) => {
  switch (annotation.annotationType) {
    case 'diagrams.FileLink': {
      return {
        status: mapAnnotationsApiStatusToCogniteAnnotationStatus(
          annotation.status
        ),
        // @ts-expect-error
        label: annotation.data.text,
        // @ts-expect-error
        page: annotation.data.pageNumber,
        resourceType: 'file',
        // @ts-expect-error
        resourceId: annotation.data.fileRef.id,
        // @ts-expect-error
        resourceExternalId: annotation.data.fileRef.externalId,
      };
    }

    case 'diagrams.AssetLink': {
      return {
        status: mapAnnotationsApiStatusToCogniteAnnotationStatus(
          annotation.status
        ),
        // @ts-expect-error
        label: annotation.data.text,
        // @ts-expect-error
        page: annotation.data.pageNumber,
        resourceType: 'asset',
        // @ts-expect-error
        resourceId: annotation.data.assetRef.id,
        // @ts-expect-error
        resourceExternalId: annotation.data.assetRef.externalId,
      };
    }

    case 'diagrams.UnhandledTextObject': {
      return {
        status: mapAnnotationsApiStatusToCogniteAnnotationStatus(
          annotation.status
        ),
        // @ts-expect-error
        page: annotation.data.pageNumber,
        // @ts-expect-error
        label: annotation.data.text,
      };
    }

    default: {
      throw new Error('Unsupported annotation type');
    }
  }
};

const getRectangleAnnotationFromCogniteAnnotation = (
  annotation: AnnotationModel,
  containerId: string
): ExtendedAnnotation => {
  const { xMin, yMin, xMax, yMax } = getBoundingBoxFromAnnotationData(
    annotation.data
  );
  return {
    id: String(annotation.id),
    containerId,
    type: UfvAnnotationType.RECTANGLE,
    x: xMin,
    y: yMin,
    width: xMax - xMin,
    height: yMax - yMin,
    style: getDefaultStylesByResourceType(getRefResourceType(annotation.data)),
    metadata: getSpecificMetadataFromAnnotationModel(annotation),
  };
};

const filterApplicableAnnotations = (annotation: AnnotationModel) => {
  if (annotation.annotatedResourceType !== 'file') {
    // eslint-disable-next-line no-console
    console.warn(
      'getAnnotationFromCogniteAnnotation currently only supports file annotations'
    );
    return false;
  }

  // NOTE: We are filtering out annotations originating from the migratin script.
  // When we remove support for the Events API, we can remove this filter.
  if (
    annotation.creatingApp === 'annotation-migration-migrate-event-annotations'
  ) {
    return false;
  }

  if (!SUPPORTED_TYPES.includes(annotation.annotationType)) {
    // eslint-disable-next-line no-console
    console.warn(`Unsupported annotation type: ${annotation.annotationType}`);
    return false;
  }

  return true;
};

const getExtendedAnnotationsFromAnnotationsApi = (
  annotations: AnnotationModel[],
  containerId: string
): ExtendedAnnotation[] =>
  annotations
    .filter(filterApplicableAnnotations)
    .map((annotation) =>
      getRectangleAnnotationFromCogniteAnnotation(annotation, containerId)
    );

export default getExtendedAnnotationsFromAnnotationsApi;
