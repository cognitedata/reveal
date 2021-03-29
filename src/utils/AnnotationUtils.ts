import { Annotation, DetectionModelType } from 'src/api/types';

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

export interface LinkedAnnotation extends Annotation {
  linkedAssetId?: number;
  linkedAssetExternalId?: string;
}

export interface VisionAnnotation extends Omit<LinkedAnnotation, 'region'> {
  label: string;
  type: string;
  color: string;
  box?: AnnotationBoundingBox;
  source: string;
  status: AnnotationStatus;
  version: number;
}

export const ModelTypeColorMap = {
  [DetectionModelType.Text]: '#C945DB',
  [DetectionModelType.Tag]: '#FF6918',
  [DetectionModelType.GDPR]: '#2F80ED',
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

  public static convertToAnnotations(
    annotations: LinkedAnnotation[],
    modelType: DetectionModelType
  ): VisionAnnotation[] {
    return annotations.map<VisionAnnotation>(
      (value: LinkedAnnotation, index: any) => {
        return {
          color: AnnotationUtils.getAnnotationColor(modelType),
          label: String(index),
          type: value.region?.shape || '',
          box: value.region && {
            xMin: value.region.vertices[0].x,
            yMin: value.region.vertices[0].y,
            xMax: value.region.vertices[1].x,
            yMax: value.region.vertices[1].y,
          },
          source: 'ocr',
          version: 1,
          status: AnnotationStatus.Unhandled,
          text: value.text,
          confidence: value.confidence,
          data: value.data,
          linkedAssetId: value.linkedAssetId,
          linkedAssetExternalId: value.linkedAssetExternalId,
        };
      }
    );
  }
}
