import {
  Annotation,
  DetectedAnnotation,
  DetectionModelType,
} from 'src/api/types';
import { VisionAsset } from 'src/store/uploadedFilesSlice';

export enum AnnotationStatus {
  Verified = 'verified',
  Rejected = 'deleted',
  Unhandled = 'unhandled',
}

export enum AnnotationDrawerMode {
  LinkAsset,
  AddAnnotation,
}

export type DrawFunction = (
  canvas: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) => void;

export type AnnotationStyle = {
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  highlight?: boolean;
  draw?: DrawFunction;
};

export type AnnotationBoundingBox = {
  xMax: number;
  xMin: number;
  yMax: number;
  yMin: number;
};

export type UnsavedAnnotation = Omit<
  Annotation,
  'id' | 'createdTime' | 'lastUpdatedTime'
>;

export interface VisionAnnotation
  extends Omit<
    Annotation,
    'id' | 'region' | 'createdTime' | 'lastUpdatedTime'
  > {
  id?: string;
  label: string;
  type: string;
  color: string;
  box?: AnnotationBoundingBox;
  status: AnnotationStatus;
  createdTime?: number;
  lastUpdatedTime?: number;
}

export const ModelTypeColorMap = {
  [DetectionModelType.Text]: '#C945DB',
  [DetectionModelType.Tag]: '#FF6918',
  [DetectionModelType.GDPR]: '#2F80ED',
};

export const ModelTypeSourceMap = {
  [DetectionModelType.Text]: 'vision/ocr',
  [DetectionModelType.Tag]: 'vision/tagdetection',
  [DetectionModelType.GDPR]: 'vision/objectdetection',
};
export const ModelTypeAnnotationTypeMap = {
  [DetectionModelType.Text]: 'ocr',
  [DetectionModelType.Tag]: 'tagdetection',
  [DetectionModelType.GDPR]: 'objectdetection',
};

export class AnnotationUtils {
  public static lineWidth = 5;

  public static getModelId(fileId: string, modelType: number): string {
    return `${modelType}-${fileId}`;
  }

  public static getAnnotationColor(modelType: DetectionModelType): string {
    return ModelTypeColorMap[modelType];
  }

  public static generateAnnotationId(
    fileId: string,
    modelType: number,
    index: number
  ): string {
    return `${index}-${AnnotationUtils.getModelId(fileId, modelType)}`;
  }

  public static getAnnotationStyle(
    color: string,
    status?: AnnotationStatus
  ): AnnotationStyle {
    const lineColor = color;
    const { lineWidth } = AnnotationUtils;

    if (status && status === AnnotationStatus.Verified) {
      return {
        strokeColor: lineColor,
        strokeWidth: lineWidth,
        highlight: false,
      };
    }

    const drawDashedRectangle = (
      canvas: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      canvas.beginPath();
      /* eslint-disable no-param-reassign */
      canvas.strokeStyle = lineColor;
      canvas.lineWidth = lineWidth;
      /* eslint-enable no-param-reassign */
      canvas.setLineDash([5, 5]);
      canvas.moveTo(x, y);
      canvas.rect(
        x - lineWidth / 2,
        y - lineWidth / 2,
        width + lineWidth,
        height + lineWidth
      );
      canvas.stroke();
    };

    return {
      draw: drawDashedRectangle,
    };
  }

  public static convertToVisionAnnotations(
    annotations: Annotation[] | DetectedAnnotation[] | UnsavedAnnotation[],
    modelType: DetectionModelType,
    fileId: number | string
  ): VisionAnnotation[] {
    return annotations.map(
      (value: Annotation | DetectedAnnotation | UnsavedAnnotation) => {
        let ann: VisionAnnotation = {
          color: AnnotationUtils.getAnnotationColor(modelType),
          text: value.text,
          label: value.text,
          type: value.region?.shape || '',
          box: value.region && {
            xMin: value.region.vertices[0].x,
            yMin: value.region.vertices[0].y,
            xMax: value.region.vertices[1].x,
            yMax: value.region.vertices[1].y,
          },
          annotationType:
            (value as UnsavedAnnotation).annotationType ||
            ModelTypeAnnotationTypeMap[modelType],
          source:
            (value as UnsavedAnnotation).source ||
            ModelTypeSourceMap[modelType],
          status:
            (value as UnsavedAnnotation).status || AnnotationStatus.Unhandled,
          data: (value as UnsavedAnnotation).data || {},
          annotatedResourceId:
            (value as UnsavedAnnotation).annotatedResourceId ||
            (typeof fileId === 'number' ? fileId : parseInt(fileId, 10)),
          annotatedResourceExternalId: (value as UnsavedAnnotation)
            .annotatedResourceExternalId,
          annotatedResourceType:
            (value as UnsavedAnnotation).annotatedResourceType || 'file',
          linkedResourceId: (value as UnsavedAnnotation).linkedResourceId,
          linkedResourceExternalId: (value as UnsavedAnnotation)
            .linkedResourceExternalId,
          linkedResourceType: (value as UnsavedAnnotation).linkedResourceType,
        };
        if (isAnnotation(value)) {
          ann = {
            ...ann,
            id: value.id.toString(),
            createdTime: value.createdTime,
            lastUpdatedTime: value.lastUpdatedTime,
          };
        }
        return ann;
      }
    );
  }

  public static createAnnotationStub(
    text: string,
    modelType: DetectionModelType
  ): VisionAnnotation {
    return {
      color: AnnotationUtils.getAnnotationColor(modelType),
      type: 'rectangle',
      source: 'user',
      status: AnnotationStatus.Verified,
      text,
      label: text,
      data: undefined,
      annotatedResourceId: 0,
      annotatedResourceType: 'file',
      annotationType: 'vision/user-annotation',
    };
  }

  public static createAnnotationFromAsset(
    asset: VisionAsset,
    fileId: string,
    box?: AnnotationBoundingBox
  ): UnsavedAnnotation {
    return {
      text: asset.name || '',
      data: {},
      ...(box && {
        region: {
          shape: 'rectangle',
          vertices: [
            {
              x: box.xMin,
              y: box.yMin,
            },
            {
              x: box.xMax,
              y: box.yMax,
            },
          ],
        },
      }),
      linkedResourceId: asset.id,
      linkedResourceExternalId: asset.externalId,
      linkedResourceType: 'asset',
      annotatedResourceId: parseInt(fileId, 10),
      annotatedResourceType: 'file',
      annotationType: 'vision/tagdetection',
      status: AnnotationStatus.Verified,
      source: 'user',
    };
  }

  public static convertToAnnotation(
    value: VisionAnnotation
  ): UnsavedAnnotation {
    return {
      region: value.box && {
        shape: 'rectangle',
        vertices: [
          {
            x: value.box.xMin,
            y: value.box.yMin,
          },
          {
            x: value.box.xMax,
            y: value.box.yMax,
          },
        ],
      },
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
  }
}

const isAnnotation = (
  ann: DetectedAnnotation | Annotation | UnsavedAnnotation
): ann is Annotation => {
  return !!(ann as Annotation).id;
};
