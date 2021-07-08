import {
  Annotation,
  AnnotationRegion,
  AnnotationSource,
  AnnotationType,
  DetectedAnnotation,
  LinkedAnnotation,
  RegionType,
  VisionAPIType,
} from 'src/api/types';
import { UnsavedAnnotation } from 'src/api/annotation/types';

export enum AnnotationStatus {
  Verified = 'verified',
  Rejected = 'rejected',
  Deleted = 'deleted', // todo: remove this once this is not needed
  Unhandled = 'unhandled',
}

export type VisionAnnotation = Omit<
  Annotation,
  'linkedResourceId' | 'linkedResourceExternalId' | 'linkedResourceType'
> & {
  label: string;
  type: RegionType;
  color: string;
  modelType: VisionAPIType;
  linkedResourceId?: number;
  linkedResourceExternalId?: string;
  linkedResourceType?: 'asset';
};

export const ModelTypeStyleMap = {
  [VisionAPIType.OCR]: {
    color: '#00665C',
    backgroundColor: '#F0FCF8',
  },
  [VisionAPIType.TagDetection]: {
    color: '#C945DB',
    backgroundColor: '#F4DAF8',
  },
  [VisionAPIType.ObjectDetection]: {
    color: '#FF8746',
    backgroundColor: '#FFE1D1',
  },
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

  public static getAnnotationColor(modelType: VisionAPIType): string {
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
    data = {},
    annotationType: AnnotationType = 'vision/ocr',
    fileExternalId?: string,
    assetId?: number,
    assetExternalId?: string
  ): VisionAnnotation {
    return {
      color:
        text === 'person'
          ? '#1AA3C1'
          : AnnotationUtils.getAnnotationColor(modelType),
      modelType,
      type,
      source,
      status: tempConvertAnnotationStatus(status),
      text,
      label: text,
      data,
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
