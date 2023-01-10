export type OCREntities = {
  name: string;
  [key: string]: string;
};

export type OCRAnnotation = {
  text: string;
  boundingBox: { xMin: number; xMax: number; yMin: number; yMax: number };
  confidence: number;
  type: 'word' | 'paragraph' | null;
  entities?: OCREntities;
};

export type OCRAnnotationPageResult = {
  annotations: OCRAnnotation[];
};
