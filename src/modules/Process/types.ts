export type AnnotationFileCount = {
  text: number;
  assets: number;
  gdpr: number;
  objects: number;
};
export type ProcessSummary = {
  totalProcessed: number;
  totalWithExif: number;
  totalUserReviewedFiles: number;
  totalModalDetected: number;
  totalUnresolvedGDPR: number;
  fileCountsByAnnotationType: AnnotationFileCount;
};
