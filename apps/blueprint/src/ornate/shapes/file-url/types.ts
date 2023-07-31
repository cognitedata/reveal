export type OrnateFileAnnotation = {
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
  resourceType: string;
  onAnnotationClick?: (data: OrnateFileAnnotation) => void;
  metadata?: Record<string, string | undefined>;
};
