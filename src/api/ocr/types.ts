export type OCRAnnotationType = 'word' | 'paragraph';
export type OCRAnnotation = {
  text: string;
  entities: any;
  boundingBox: {
    xMax: number;
    xMin: number;
    yMax: number;
    yMin: number;
  };
  confidence: number;
  type: OCRAnnotationType;
};
