import {
  Annotation,
  AnnotationMetadata,
  AnnotationRegion,
  AnnotationSource,
  AnnotationType,
  DetectedAnnotation,
  LinkedAnnotation,
  RegionType,
  Vertex,
  VisionAPIType,
} from 'src/api/types';
import { UnsavedAnnotation } from 'src/api/annotation/types';
import { Keypoint } from 'src/modules/Common/Components/CollectionSettingsModal/CollectionSettingsTypes';
import {
  ColorsObjectDetection,
  ColorsOCR,
  ColorsPersonDetection,
  ColorsTagDetection,
  ColorsTextAndIconsSecondary,
} from 'src/constants/Colors';

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

export type VisionAnnotation = Omit<
  Annotation,
  | 'linkedResourceId'
  | 'linkedResourceExternalId'
  | 'linkedResourceType'
  | 'region'
> & {
  region?: VisionAnnotationRegion;
  label: string;
  type: RegionType;
  color: string;
  modelType: VisionAPIType;
  linkedResourceId?: number;
  linkedResourceExternalId?: string;
  linkedResourceType?: 'asset';
};

export const ModelTypeStyleMap = {
  [VisionAPIType.OCR]: ColorsOCR,
  [VisionAPIType.TagDetection]: ColorsTagDetection,
  [VisionAPIType.ObjectDetection]: ColorsObjectDetection,
};
export const ModelTypeIconMap: { [key: number]: string } = {
  [VisionAPIType.OCR]: 'Scan',
  [VisionAPIType.TagDetection]: 'ResourceAssets',
  [VisionAPIType.ObjectDetection]: 'Scan',
};

export const ModelTypeSourceMap: { [key: number]: AnnotationSource } = {
  [VisionAPIType.OCR]: 'vision/ocr',
  [VisionAPIType.TagDetection]: 'vision/tagdetection',
  [VisionAPIType.ObjectDetection]: 'vision/objectdetection',
};
export const ModelTypeAnnotationTypeMap: { [key: number]: AnnotationType } = {
  [VisionAPIType.OCR]: 'vision/ocr',
  [VisionAPIType.TagDetection]: 'vision/tagdetection',
  [VisionAPIType.ObjectDetection]: 'vision/objectdetection',
};

export const AnnotationTypeModelTypeMap = {
  'vision/ocr': VisionAPIType.OCR,
  'vision/tagdetection': VisionAPIType.TagDetection,
  'vision/objectdetection': VisionAPIType.ObjectDetection,
};

export class AnnotationUtils {
  public static lineWidth = 5;

  public static getModelId(fileId: string, modelType: number): string {
    return `${modelType}-${fileId}`;
  }

  public static getAnnotationColor(
    text: string,
    modelType: VisionAPIType,
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

  public static convertToVisionAnnotations(
    annotations: Annotation[]
  ): VisionAnnotation[] {
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

      if (isLinkedAnnotation(value)) {
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
    modelType: VisionAPIType,
    fileId: number,
    createdTime: number,
    lastUpdatedTime: number,
    region?: AnnotationRegion,
    type: RegionType = 'rectangle',
    source: AnnotationSource = 'user',
    status = AnnotationStatus.Unhandled,
    data?: AnnotationMetadata,
    annotationType: AnnotationType = 'vision/ocr',
    fileExternalId?: string,
    assetId?: number,
    assetExternalId?: string
  ): VisionAnnotation {
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

  public static convertToAnnotation(value: VisionAnnotation): Annotation {
    const ann: Annotation = {
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

  public static getAnnotationsDetectionModelType = (
    ann: Annotation
  ): VisionAPIType => {
    if (isLinkedAnnotation(ann)) {
      return VisionAPIType.TagDetection;
    }

    if (ann.source === 'vision/ocr') {
      return VisionAPIType.OCR;
    }
    return VisionAPIType.ObjectDetection;
  };
}

const populateKeyPoints = (annotation: VisionAnnotation) => {
  const keypointAnnotation: VisionAnnotation = { ...annotation };
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
      console.error(
        'keypoint metadata was not found for annotation!',
        keypointAnnotation.id
      );
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

  // const keypointCollections = predefinedCollections?.predefinedKeyPoints;
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

export const isAnnotation = (
  ann: DetectedAnnotation | Annotation | UnsavedAnnotation
): ann is Annotation => {
  return !!(ann as Annotation).id && !!(ann as Annotation).lastUpdatedTime;
};

export const isUnSavedAnnotation = (
  ann: DetectedAnnotation | Annotation | UnsavedAnnotation
): ann is UnsavedAnnotation => {
  return !(ann as Annotation).lastUpdatedTime;
};

export const isLinkedAnnotation = (ann: Annotation): boolean => {
  return !!(ann as LinkedAnnotation).linkedResourceType;
};

export const isKeyPointAnnotation = (ann: Annotation): boolean => {
  return (ann as LinkedAnnotation).region?.shape === 'points';
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
