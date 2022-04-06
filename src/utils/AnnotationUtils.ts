import {
  AnnotationRegion,
  DetectedAnnotation,
  RegionType,
  Vertex,
  VisionDetectionModelType,
} from 'src/api/vision/detectionModels/types';
import {
  CDFAnnotationV1,
  AnnotationMetadata,
  AnnotationSource,
  AnnotationTypeV1,
  UnsavedAnnotation,
} from 'src/api/annotation/types';
import {
  ColorsObjectDetection,
  ColorsOCR,
  ColorsPersonDetection,
  ColorsTagDetection,
  ColorsTextAndIconsSecondary,
} from 'src/constants/Colors';
import { Keypoint } from 'src/modules/Review/types';
import { AnnotationsBadgeCounts } from 'src/modules/Common/types';
import { AllIconTypes } from '@cognite/cogs.js';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationFilterType } from 'src/modules/FilterSidePanel/types';
import {
  isAssetLinkedAnnotation,
  isKeyPointAnnotation,
} from 'src/api/annotation/TypeGuards';

export enum AnnotationStatus {
  Verified = 'verified',
  Rejected = 'rejected',
  Deleted = 'deleted', // todo: remove this once this is not needed
  Unhandled = 'unhandled',
}

export type KeypointItem = Required<Keypoint> & {
  id: string;
  selected: boolean;
};

export type KeypointVertex = Vertex & KeypointItem;

export type VisionAnnotationRegion = Pick<AnnotationRegion, 'shape'> & {
  vertices: Array<Vertex | KeypointVertex>;
};

export type VisionAnnotationV1 = Omit<
  CDFAnnotationV1,
  | 'linkedResourceId'
  | 'linkedResourceExternalId'
  | 'linkedResourceType'
  | 'region'
> & {
  region?: VisionAnnotationRegion;
  label: string;
  type: RegionType;
  color: string;
  modelType: VisionDetectionModelType;
  linkedResourceId?: number;
  linkedResourceExternalId?: string;
  linkedResourceType?: 'asset';
};

export const ModelTypeStyleMap = {
  [VisionDetectionModelType.OCR]: ColorsOCR,
  [VisionDetectionModelType.TagDetection]: ColorsTagDetection,
  [VisionDetectionModelType.ObjectDetection]: ColorsObjectDetection,
  [VisionDetectionModelType.CustomModel]: ColorsObjectDetection, // custom models are regarded as object detection models
};
export const ModelTypeIconMap: { [key: number]: string } = {
  [VisionDetectionModelType.OCR]: 'Scan',
  [VisionDetectionModelType.TagDetection]: 'ResourceAssets',
  [VisionDetectionModelType.ObjectDetection]: 'Scan',
  [VisionDetectionModelType.CustomModel]: 'Scan',
};

export const ModelTypeAnnotationTypeMap: { [key: number]: AnnotationTypeV1 } = {
  [VisionDetectionModelType.OCR]: 'vision/ocr',
  [VisionDetectionModelType.TagDetection]: 'vision/tagdetection',
  [VisionDetectionModelType.ObjectDetection]: 'vision/objectdetection',
  [VisionDetectionModelType.CustomModel]: 'vision/custommodel',
};

export const AnnotationTypeModelTypeMap = {
  'vision/ocr': VisionDetectionModelType.OCR,
  'vision/tagdetection': VisionDetectionModelType.TagDetection,
  'vision/objectdetection': VisionDetectionModelType.ObjectDetection,
  user_defined: VisionDetectionModelType.ObjectDetection,
  CDF_ANNOTATION_TEMPLATE: VisionDetectionModelType.ObjectDetection,
};

export interface AnnotationIdsByStatus {
  rejectedAnnotationIds: number[];
  acceptedAnnotationIds: number[];
  unhandledAnnotationIds: number[];
}

export class AnnotationUtils {
  public static lineWidth = 5;

  public static getModelId(fileId: string, modelType: number): string {
    return `${modelType}-${fileId}`;
  }

  public static getAnnotationColor(
    text: string,
    modelType: VisionDetectionModelType,
    data?: AnnotationMetadata
  ): string {
    if (data) {
      if (data.color) {
        return data.color;
      }
      if (data.keypoint) {
        return ColorsTextAndIconsSecondary.color;
      }
    }
    if (text === 'person') {
      return ColorsPersonDetection.color;
    }
    return ModelTypeStyleMap[modelType].color;
  }

  public static getIconType = (annotation: {
    text: string;
    modelType: VisionDetectionModelType;
  }) => {
    return annotation.text === 'person'
      ? 'Personrounded'
      : (ModelTypeIconMap[annotation.modelType] as AllIconTypes);
  };

  public static convertToVisionAnnotations(
    annotations: CDFAnnotationV1[]
  ): VisionAnnotationV1[] {
    return annotations.map((value) => {
      let ann = AnnotationUtils.createVisionAnnotationStub(
        value.id,
        value.text,
        AnnotationUtils.getAnnotationsDetectionModelType(value),
        value.annotatedResourceId,
        value.createdTime,
        value.lastUpdatedTime,
        value.region,
        value.region && value.region.shape,
        value.source,
        value.status,
        value.data,
        value.annotationType,
        value.annotatedResourceExternalId
      );

      if (isAssetLinkedAnnotation(value)) {
        ann = {
          ...ann,
          linkedResourceId: value.linkedResourceId,
          linkedResourceExternalId: value.linkedResourceExternalId,
          linkedResourceType: 'asset',
        };
      }
      if (isKeyPointAnnotation(value)) {
        ann = populateKeyPoints(ann);
      }
      return ann;
    });
  }

  public static createVisionAnnotationStub(
    id: number,
    text: string,
    modelType: VisionDetectionModelType,
    fileId: number,
    createdTime: number,
    lastUpdatedTime: number,
    region?: AnnotationRegion,
    type: RegionType = 'rectangle', // TODO: get this from region.shape?
    source: AnnotationSource = 'user',
    status = AnnotationStatus.Unhandled,
    data?: AnnotationMetadata,
    annotationType: AnnotationTypeV1 = 'vision/ocr',
    fileExternalId?: string,
    assetId?: number,
    assetExternalId?: string
  ): VisionAnnotationV1 {
    return {
      color: AnnotationUtils.getAnnotationColor(text, modelType, data),
      modelType,
      type,
      source,
      status: tempConvertAnnotationStatus(status),
      text,
      label: text,
      data: data || {},
      annotatedResourceId: fileId,
      annotatedResourceType: 'file',
      annotatedResourceExternalId: fileExternalId!,
      annotationType,
      id,
      region,
      ...(!!assetId && {
        linkedResourceId: assetId,
        linkedResourceExternalId: assetExternalId,
        linkedResourceType: 'asset',
      }),
      createdTime,
      lastUpdatedTime,
    };
  }

  public static convertToAnnotation(
    value: VisionAnnotationV1
  ): CDFAnnotationV1 {
    const ann: CDFAnnotationV1 = {
      id: value.id,
      createdTime: value.createdTime,
      lastUpdatedTime: value.lastUpdatedTime,
      region: value.region,
      source: value.source,
      status: value.status,
      text: value.text,
      data: value.data || {},
      linkedResourceId: value.linkedResourceId,
      linkedResourceExternalId: value.linkedResourceExternalId,
      linkedResourceType: value.linkedResourceType,
      annotatedResourceId: value.annotatedResourceId,
      annotatedResourceType: value.annotatedResourceType,
      annotationType: value.annotationType,
    };

    return ann;
  }

  public static filterAnnotations(
    annotations: VisionAnnotationV1[],
    filter?: AnnotationFilterType
  ): VisionAnnotationV1[] {
    let filteredAnnotations = annotations;
    if (filter) {
      if (filter.annotationState) {
        filteredAnnotations = filteredAnnotations.filter(
          (item) => item.status === filter.annotationState
        );
      }
      if (filter.annotationText) {
        filteredAnnotations = filteredAnnotations.filter(
          (item) => item.text === filter.annotationText
        );
      }
    }
    return filteredAnnotations;
  }

  public static getAnnotationsDetectionModelType = (
    ann: CDFAnnotationV1
  ): VisionDetectionModelType => {
    if (isAssetLinkedAnnotation(ann)) {
      return VisionDetectionModelType.TagDetection;
    }

    if (ann.annotationType === 'vision/ocr') {
      return VisionDetectionModelType.OCR;
    }
    return VisionDetectionModelType.ObjectDetection;
  };

  public static filterAnnotationsIdsByAnnotationStatus(
    annotations: VisionAnnotationV1[]
  ): AnnotationIdsByStatus {
    const rejectedAnnotationIds: number[] = [];
    const acceptedAnnotationIds: number[] = [];
    const unhandledAnnotationIds: number[] = [];
    annotations.forEach((annotation) => {
      const annotationId = annotation.id;
      if (annotation.status === AnnotationStatus.Verified)
        acceptedAnnotationIds.push(annotationId);
      else if (annotation.status === AnnotationStatus.Rejected)
        rejectedAnnotationIds.push(annotationId);
      else unhandledAnnotationIds.push(annotationId);
    });
    return {
      rejectedAnnotationIds,
      acceptedAnnotationIds,
      unhandledAnnotationIds,
    };
  }

  public static filterAnnotationsIdsByConfidence(
    annotations: VisionAnnotationV1[],
    rejectedThreshold: number,
    acceptedThreshold: number
  ): AnnotationIdsByStatus {
    const rejectedAnnotationIds: number[] = [];
    const acceptedAnnotationIds: number[] = [];
    const unhandledAnnotationIds: number[] = [];
    annotations.forEach((annotation) => {
      const annotationId = annotation.id;
      if (annotation.data?.confidence) {
        const { confidence } = annotation.data;
        if (confidence > acceptedThreshold)
          acceptedAnnotationIds.push(annotationId);
        else if (confidence < rejectedThreshold)
          rejectedAnnotationIds.push(annotationId);
        else unhandledAnnotationIds.push(annotationId);
      } else {
        // Fallback to filter by status if there's no confidence value.
        // This is the case for manually labelled annotations.
        const filteredByStatus = this.filterAnnotationsIdsByAnnotationStatus([
          annotation,
        ]);
        acceptedAnnotationIds.push(...filteredByStatus.acceptedAnnotationIds);
        rejectedAnnotationIds.push(...filteredByStatus.rejectedAnnotationIds);
        unhandledAnnotationIds.push(...filteredByStatus.unhandledAnnotationIds);
      }
    });
    return {
      rejectedAnnotationIds,
      acceptedAnnotationIds,
      unhandledAnnotationIds,
    };
  }
}

const populateKeyPoints = (annotation: VisionAnnotationV1) => {
  const keypointAnnotation: VisionAnnotationV1 = { ...annotation };
  const keypointMeta = (annotation.data as AnnotationMetadata).keypoints;

  if (keypointAnnotation.region) {
    if (keypointMeta) {
      keypointAnnotation.region.vertices =
        keypointAnnotation.region.vertices.map((vertex, index) => {
          const keyPointData =
            (keypointMeta.find(
              (keyPointMetaItem) => keyPointMetaItem.order === String(index + 1)
            ) as KeypointItem) || {};

          return {
            ...vertex,
            ...keyPointData,
            defaultPosition: [vertex.x, vertex.y],
            id: `${annotation.id}-${keyPointData.caption}`,
          };
        });
    } else {
      keypointAnnotation.region.vertices =
        keypointAnnotation.region.vertices.map((vertex, index) => {
          const keyPointData = {
            order: String(index + 1),
            caption: annotation.text,
            color: ColorsObjectDetection.color,
          };

          return {
            ...vertex,
            ...keyPointData,
            defaultPosition: [vertex.x, vertex.y],
            id: `${annotation.id}-${keyPointData.order}`,
          };
        });
      keypointAnnotation.data = { ...keypointAnnotation.data, keypoint: true };
    }
  }
  // Populate keypoint data

  // const keypointCollections = predefinedAnnotations?.predefinedKeyPoints;
  // let keypointCollection: KeypointCollection | undefined;
  // if (keypointCollections && keypointCollections.length) {
  //   keypointCollection = keypointCollections.find(
  //     (collection) => collection.collectionName === annotation.text
  //   );
  // }
  // if (
  //   keypointCollection &&
  //   keypointAnnotation.region &&
  //   keypointAnnotation.region.vertices
  // ) {
  //   keypointAnnotation.keypoints = keypointAnnotation.region.vertices.map(
  //     (vertex, index) => {
  //       const vertexOrder = String(index + 1);
  //       const keypointSetting = keypointCollection?.keypoints?.find(
  //         (keypoint) => keypoint.order === vertexOrder
  //       );
  //       if (keypointSetting) {
  //         return {
  //           id: vertex.id!,
  //           color: keypointSetting.color,
  //           label: keypointSetting.caption,
  //           order: keypointSetting.order,
  //         };
  //       }
  //       return {
  //         id: vertex.id!,
  //         color: keypointAnnotation.color,
  //         label: 'No Collection Found',
  //         order: vertexOrder,
  //       };
  //     }
  //   );
  // } else {
  //   keypointAnnotation.keypoints = keypointAnnotation!.region!.vertices.map(
  //     (vertex, index) => ({
  //       id: vertex.id!,
  //       color: keypointAnnotation.color,
  //       label: 'No Collection Found',
  //       order: String(index + 1),
  //     })
  //   );
  // }
  return keypointAnnotation;
};

export const getAnnotationCounts = (annotations: VisionAnnotationV1[]) => {
  const counts: { [text: string]: number } = {};

  annotations.forEach((item) => {
    counts[item.label] = 1 + (counts[item.label] || 0);
  });

  return counts;
};

export const getAnnotationsBadgeCounts = (
  annotations: VisionAnnotationV1[]
) => {
  const annotationsBadgeProps: AnnotationsBadgeCounts = {
    objects: 0,
    assets: 0,
    text: 0,
    gdpr: 0,
    mostFrequentObject: undefined,
  };
  if (annotations) {
    annotationsBadgeProps.text = annotations.filter(
      (item) => item.modelType === VisionDetectionModelType.OCR
    ).length;

    annotationsBadgeProps.assets = annotations.filter(
      (item) => item.modelType === VisionDetectionModelType.TagDetection
    ).length;

    annotationsBadgeProps.gdpr = annotations.filter(
      (item) =>
        item.modelType === VisionDetectionModelType.ObjectDetection &&
        item.label === 'person'
    ).length;

    const objects = annotations.filter(
      (item) =>
        [
          VisionDetectionModelType.ObjectDetection,
          VisionDetectionModelType.CustomModel,
        ].includes(item.modelType) && item.label !== 'person'
    );
    annotationsBadgeProps.objects = objects.length;
    const counts = getAnnotationCounts(objects);
    annotationsBadgeProps.mostFrequentObject = Object.entries(counts).length
      ? Object.entries(counts).reduce((a, b) => (a[1] > b[1] ? a : b))
      : undefined;
  }

  return annotationsBadgeProps;
};

export const calculateBadgeCountsDifferences = (
  allCounts: AnnotationsBadgeCounts,
  subsetCounts: AnnotationsBadgeCounts
) => {
  const diff = allCounts;
  diff.gdpr -= subsetCounts.gdpr;
  diff.assets -= subsetCounts.assets;
  diff.text -= subsetCounts.text;
  diff.objects -= subsetCounts.objects;
  // Clamp the counts in case we have any negative values
  // Also, check that the counts are not falsy.
  diff.gdpr = Math.max(diff.gdpr, 0) || 0;
  diff.assets = Math.max(diff.assets, 0) || 0;
  diff.text = Math.max(diff.text, 0) || 0;
  diff.objects = Math.max(diff.objects, 0) || 0;
  // TODO: find a way to re-compute mostFrequentObjects without passing the
  // annotations as parameter ot this function
  diff.mostFrequentObject = undefined;
  return diff;
};

export const isAnnotation = (
  ann: DetectedAnnotation | CDFAnnotationV1 | UnsavedAnnotation
): ann is CDFAnnotationV1 => {
  return (
    !!(ann as CDFAnnotationV1).id && !!(ann as CDFAnnotationV1).lastUpdatedTime
  );
};

export const isUnSavedAnnotation = (
  ann: DetectedAnnotation | CDFAnnotationV1 | UnsavedAnnotation
): ann is UnsavedAnnotation => {
  return !(ann as CDFAnnotationV1).lastUpdatedTime;
};

export const createUniqueId = (text: string): string => {
  return `${text.replace(/(\s)/g, '_').trim()}-${uuidv4()}`;
};

// todo: remove this function once they are not needed - start

export const tempConvertAnnotationStatus = (
  status: AnnotationStatus
): AnnotationStatus => {
  if (status === AnnotationStatus.Deleted) {
    return AnnotationStatus.Rejected;
  }
  return status;
};

// todo: remove these function once they are not needed - end
