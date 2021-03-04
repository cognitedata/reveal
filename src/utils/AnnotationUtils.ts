import { DetectionModelType, Annotation } from 'src/api/types';

export type AnnotationStatus = 'verified' | 'deleted' | 'unhandled';

export interface CogniteAnnotation extends Omit<Annotation, 'shape'> {
  id: string;
  label: string;
  box: {
    xMax: number;
    xMin: number;
    yMax: number;
    yMin: number;
  };
  source: string;
  status: AnnotationStatus;
  version: number;
  mark?: {
    backgroundColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    highlight?: boolean;
  };
}

export class AnnotationUtils {
  public static annotationColor = '#C945DB';

  public static convertToAnnotations(
    annotations: Annotation[],
    modelType: DetectionModelType
  ): CogniteAnnotation[] {
    return annotations.map<CogniteAnnotation>((value, index) => {
      return {
        id: `${modelType}-${index}`,
        label: String(index),
        box: {
          xMin: value.shape.vertices[0].x,
          yMin: value.shape.vertices[0].y,
          xMax: value.shape.vertices[1].x,
          yMax: value.shape.vertices[1].y,
        },
        ...value,
        source: 'ocr',
        version: 1,
        status: 'verified',
        mark: {
          strokeColor: AnnotationUtils.annotationColor,
          strokeWidth: 2,
          highlight: false,
        },
      };
    });
  }
}
