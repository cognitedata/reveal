import { OCRAnnotation } from '../api/ocrAnnotations';

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
}

export class AnnotationUtils {
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
      };
    });
  }
}
