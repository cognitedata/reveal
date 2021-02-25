import { OCRAnnotation } from 'src/api/ocr/types';

export type AnnotationStatus = 'verified' | 'deleted' | 'unhandled';

export interface CogniteAnnotation extends Omit<OCRAnnotation, 'boundingBox'> {
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
    ocrAnnotations: OCRAnnotation[]
  ): CogniteAnnotation[] {
    return ocrAnnotations.map<CogniteAnnotation>((value, index) => {
      return {
        id: String(index),
        label: String(index),
        box: value.boundingBox,
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
